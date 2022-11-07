import DoubleSlider from '../../../components/double-slider';
import SortableTable from '../../../components/sortable-table';

import header from './product-header';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    this.url = new URL(`${BACKEND_URL}api/rest/products?_embed=subcategory.category`);

    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.getSubElements();

    await this.initComponents();
    await this.renderComponents();

    this.initEventListener();

    return this.element;
  }

  async initComponents() {
    this.components.sortableTable = new SortableTable(header, { url: this.url });
    const maxPrice = await this.components.sortableTable.getMaxValue('price');

    this.components.doubleSlider = new DoubleSlider(maxPrice);
  }

  async renderComponents() {
    const doubleSlider = this.components.doubleSlider.element;
    const sortableTable = this.components.sortableTable.element;

    this.subElements.sliderContainer.append(doubleSlider);
    this.subElements.sortableTable.append(sortableTable);
  }

  async updateComponents() {
    const status = this.subElements.filterStatus.value;
    const name = this.subElements.filterName.value;
    const rangeStart = this.subElements.sliderContainer.querySelector(
      '[data-element="startValue"]'
    );
    const rangeEnd = this.subElements.sliderContainer.querySelector('[data-element="endValue"]');

    if (status) {
      this.url.searchParams.set('status', status);
    } else {
      this.url.searchParams.delete('status');
    }

    if (name) {
      this.url.searchParams.set('title_like', name);
    } else {
      this.url.searchParams.delete('title_like');
    }

    this.url.searchParams.set('price_gte', rangeStart.textContent.replace('$', ''));
    this.url.searchParams.set('price_lte', rangeEnd.textContent.replace('$', ''));

    this.components.sortableTable.updateData(this.url);
  }

  inputHandler = () => {
    this.updateComponents();
  };

  rangeHandler = () => {
    this.updateComponents();
  };

  selectHandler = () => {
    this.updateComponents();
  };

  clearData = () => {
    this.components.doubleSlider.clearSlider();
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';

    this.updateComponents();
  };

  initEventListener() {
    this.subElements.filterName.addEventListener('input', this.inputHandler);
    document.addEventListener('range-select', this.rangeHandler);
    this.subElements.filterStatus.addEventListener('change', this.selectHandler);
    document.addEventListener('clear-data', this.clearData);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  }

  get template() {
    return `
      <div class="product-list">
        <div class="content__top-panel">
          <h1 class="page-title">Products</h1>
          <a href="/products/add" class="button-primary">Add product</a>
        </div>
        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Sort on:</label>
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
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Object.keys(this.components).forEach(componentName => this.components[componentName].destroy());
    document.removeEventListener('clear-data', this.clearData);
    document.removeEventListener('range-select', this.rangeHandler);
  }
}
