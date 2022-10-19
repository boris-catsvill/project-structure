import SortableTable from "../../../components/sortable-table/index.js";
import DoubleSlider from "../../../components/double-slider/index.js";
import header from "../list/list-header.js"
import fetchJson from "../../../utils/fetch-json.js";
import select from '../../../utils/select.js';
import style from './style.css'

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};

  url = new URL('api/rest/products', BACKEND_URL);


  getTeamplate () {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">List page</h1>
          <a href="/products/add" class="button-primary">Add product</a>
        </div>

        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Sort by:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Product name">
            </div>

            <div data-element="doubleSlider" class="form-group">
              <label class="form-label">Price:</label>
            </div>

            <div class="form-group">
              <label class="form-label">Status:</label>
              <select class="form-control" data-element="filterStatus">
                <option value="" selected="">Any</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </form>
        </div>

        <div data-element="sortableTable" class="products-list__container"></div>
      </div>
    `
  }

  initComponents () {
    this.url.searchParams.set('_embed', 'subcategory.category');

    const sortableTable = new SortableTable(header, {
      url: this.url,
      start: 0,
      step: 30
    });

    const doubleSlider = new DoubleSlider();

    this.components = {
      sortableTable,
      doubleSlider,
    }

    this.components.sortableTable.subElements.emptyPlaceholder.innerHTML = this.createEmptyPlaceholder();
  }

  createEmptyPlaceholder () {
    return `
      <p>No products found matching the selected criteria</p>
      <button type="button" class="button-primary-outline">Clear filters</button>
    `
  }

  renderComponents () {
    for (const key of Object.keys(this.components)) {
      this.subElements[key].append(this.components[key].element)
    }
  }

  setUrl () {
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('_sort', `${this.components.sortableTable.sorted.id}`);
    this.url.searchParams.set('_order', `${this.components.sortableTable.sorted.order}`);
  }

  initEventListeners () {
    const innerSlider = this.components.doubleSlider.element.querySelector('[data-element=inner]');

    this.components.sortableTable.subElements.emptyPlaceholder.querySelector('button').addEventListener('click', () => {
      this.subElements.filterName.value = '';

      this.components.doubleSlider.element.firstElementChild.innerHTML = '$0';
      this.components.doubleSlider.element.lastElementChild.innerHTML = '$4000';
      innerSlider.firstElementChild.style = '0%';
      innerSlider.querySelector('[data-element=thumbLeft]').style = '0%';
      innerSlider.querySelector('[data-element=thumbRight]').style = '0%';

      this.subElements.filterStatus.value = '';

      this.updateByClear();
    })

    this.subElements.filterName.addEventListener('input', (event) => {
      const value = event.target.value;
    
      this.timerId = clearInterval( this.timerId)
      this.timerId = setTimeout(this.updateByName, 500, value);
    });

    this.components.doubleSlider.element.addEventListener('range-select', (event) => {
      const from = event.target.firstElementChild.textContent.slice(1);
      const to = event.target.lastElementChild.textContent.slice(1);

      this.updateBySlider(from, to)
    });

    this.subElements.filterStatus.addEventListener('change', (event) => {
      const selectValue = event.target.value;

      this.updateBySelect(selectValue)
    });

    this.components.sortableTable.url = this.url;
  }

  async updateByClear () {
    this.url.searchParams.delete('status');
    this.url.searchParams.delete('title_like');
    this.url.searchParams.set('price_gte', '0');
    this.url.searchParams.set('price_lte', '4000');

    const data = await fetchJson(this.url);

    this.components.sortableTable.updateClear(data)
  }

  updateByName = async (value) => {
    this.url.searchParams.set('title_like', value);
    this.setUrl();
    const data = await fetchJson(this.url);

    this.components.sortableTable.updateClear(data)
  }

  async updateBySlider (from, to) {
    this.setUrl();
    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);

    const data = await fetchJson(this.url);

    this.components.sortableTable.updateClear(data)
  }

  async updateBySelect (value) {
    if (value) {
      this.setUrl();
      this.url.searchParams.set('status', value);
    } else {
      this.url.searchParams.delete('status');
    }  
    const data = await fetchJson(this.url);
    this.components.sortableTable.updateClear(data)
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTeamplate();

    const element = wrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements();
    select();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements () {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
  }
}