import SortableTable from "../../../components/sortable-table/index.js";
import DoubleSlider from "../../../components/double-slider/index.js";
import header from './headerConfig.js';

import fetchJson from "../../../utils/fetch-json.js";

export default class Page {
  element;
  subElements = {};
  components = {};
  range = {
    min: 0,
    max: 4000
  };
  url = new URL('api/rest/products', process.env.BACKEND_URL);

  getTemplate() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Products</h1>
          <a href="/products/add" class="button-primary">Add product</a>
        </div>
        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Sort by:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Product name">
            </div>
            <div class="form-group" data-element="sliderContainer">
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
        <div data-element="productsContainer" class="products-list__container"></div>
      </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll(`[data-element]`);

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  initComponents() {
    const doubleSlider = new DoubleSlider({
      min: this.range.min,
      max: this.range.max
    });

    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products?_embed=subcategory.category',
      range: this.range,
      rowTemplate: (html, item) => `<a href="/products/${item.id}" class="sortable-table__row">${html}</a>`
    });

    this.components = {
      doubleSlider,
      sortableTable
    }
  }

  getComponents() {
    const { sliderContainer, productsContainer } = this.subElements;

    sliderContainer.append(this.components.doubleSlider.element);
    productsContainer.append(this.components.sortableTable.element);
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.getComponents();
    this.initEventListeners();

    return this.element;
  }

  onSliderRangeSelect = (event) => {
    const { from, to } = event.detail

    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);

    this.update();
  }

  onFilterNameInput = (event) => {
   setTimeout(() => {
      if (!event.target.value.length) {
        this.url.searchParams.delete('title_like');
        this.update();
        return;
      }
      this.url.searchParams.set('title_like', event.target.value);
      this.update();
    }, 500);
  }

  onFilterStatusChange = (event) => {
    if (event.target.value !== '') {
      this.url.searchParams.set('status', event.target.value);
      this.update();
      return;
    }
    this.url.searchParams.delete('status');
    this.update();
  }

  async update() {
    const data = await fetchJson(this.url);

    this.components.sortableTable.update(data);
  }

  initEventListeners() {
    this.components.doubleSlider.element.addEventListener('range-select', this.onSliderRangeSelect);
    this.subElements.filterName.addEventListener('input', this.onFilterNameInput);
    this.subElements.filterStatus.addEventListener('change', this.onFilterStatusChange);
  }

  remove() {
    if (this.element) {
      this.element.remove;
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.components = {};
    Object.values(this.components).forEach((component) => {
      component.destroy();
    });
  }

}
