import DoubleSlider from "../../../components/double-slider/index.js";
import SortableTable from '../../../components/sortable-table/index.js';
import header from './products-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  minPrice = 0;
  maxPrice = 4000;

  onRangeSelect = async (event) => {
    await this.components.sortableTable.update({price_gte: event.detail.from, price_lte: event.detail.to});
  }

  onFilterNameChange = async (event) => {
    await this.components.sortableTable.update({title_like: event.target.value});
  }

  onStatusChange = async (event) => {
    await this.components.sortableTable.update({status : event.target.value});
  }

  onFiltersReset = async (event) => {
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.components.doubleSlider.reset();
    this.components.sortableTable.resetUrlSettings();

    await this.components.sortableTable.update({_embed: 'subcategory.category'});
  }

  get template() {
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
              <option value="0">Not active</option>
            </select>
          </div>
        </form>
      </div>
      <div data-element="productsContainer" class="products-list__container"></div>
    </div>`;
  }

  createComponents() {
    const doubleSlider = new DoubleSlider({min: this.minPrice, max: this.maxPrice});

    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products',
      isRowsClickable : true,
      urlSettings: {_embed: 'subcategory.category'}
    });
    
    this.components = {doubleSlider, sortableTable};
  }

  addComponents() {
    this.subElements.sliderContainer.append(this.components.doubleSlider.element);
    this.subElements.productsContainer.append(this.components.sortableTable.element);
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.createComponents();
    this.addComponents();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.subElements.sliderContainer.addEventListener('range-select', this.onRangeSelect);
    this.subElements.filterName.addEventListener('input', this.onFilterNameChange);
    this.subElements.filterStatus.addEventListener('change', this.onStatusChange);
    this.subElements.productsContainer.addEventListener('reset-filters', this.onFiltersReset);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

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
    Object.values(this.components).map(component => component.destroy());
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}