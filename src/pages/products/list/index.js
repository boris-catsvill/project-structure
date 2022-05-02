import DoubleSlider from '../../../components/double-slider/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import header from './products-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  getTemplate() {
    return `<div class="products-list">
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
                      <option value="0">Not active</option>
                    </select>
                  </div>
                </form>
              </div>
              <div data-element="productsContainer" class="products-list__container"></div>
            </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll(`[data-element]`);
    const result = {};

    for (const element of elements) {
      result[element.dataset.element] = element;
    }

    return result;
  }

  initComponents() {
    this.components.sliderContainer = new DoubleSlider({min: 0, max: 4000});
    this.components.productsContainer = new SortableTable(header, {
        url: 'api/rest/products?_embed=subcategory.category',
        isSortLocally: false,
        sorted: {
          id: 'title',
          order: 'asc',
        },
        isRowClickable: true,
      }
    );

    for (let component of Object.keys(this.components)) {
      this.subElements[component].append(this.components[component].element);
    }
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.initComponents();
    this.addEventListeners();

    return this.element;
  }

  updatePriceRange = async (event) => {
    const settings = {
      "price_gte" : event.detail.from,
      "price_lte" : event.detail.to,
    };

    await this.components.productsContainer.update(settings);
  }

  updateName = async (event) => {
    const settings = {
      "title_like" : event.target.value,
    };

    await this.components.productsContainer.update(settings);
  }

  updateStatus = async (event) => {
    const settings = {
      "status" : event.target.value,
    };

    await this.components.productsContainer.update(settings);
  }

  addEventListeners() {
    this.subElements.sliderContainer.addEventListener('range-select', this.updatePriceRange);
    this.subElements.filterName.addEventListener('input', this.updateName);
    this.subElements.filterStatus.addEventListener('change', this.updateStatus);
  }

  removeEventListeners() {
    this.subElements.sliderContainer.removeEventListener('range-select', this.updateFilterName);
    this.subElements.filterName.removeEventListener('input', this.updateName);
    this.subElements.filterStatus.removeEventListener('change', this.updateStatus);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
    this.element = null;
  }
}
