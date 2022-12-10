import SortableTable from '../../../components/sortable-table/index.js';
import Doubleslider from '../../../components/double-slider/index.js';
import header from './products-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    await this.renderComponents();

    this.initEventListener();

    return this.element;
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

  getTemplate() {
    return `
          <div class="products-list">
            <div class="content__top-panel">
              <h2 class="page-title">Products</h2>
              <a href="/products/add" class="button-primary">Add product</a>
            </div>

            <div class="content-box content-box_small">
              <form class="form-inline">
                <div class="form-group">
                  <label class="form-label">Sort by:</label>
                  <input type="text" data-element="filterName" class="form-control" placeholder="Name product">
                </div>
                <div class="form-group" data-element="sliderContainer">
                  <label class="form-label">Price:</label>
                  <!-- double-slider component -->
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

            <div data-elem="productsContainer" class="products-list__container">
              <div data-element="sortableTable" class="sortable-table">
              <!-- sortable-table component -->
              </div>
            </div>
          </div>
        `;
  }

  initComponents() {
    this.components.doubleSlider = new Doubleslider({
      min: 0,
      max: 4000,
      formatValue: value => '$' + value,
    });

    this.products = {
      url: `api/rest/products?_embed=subcategory.category`,
    };
    this.components.sortableTable = new SortableTable(header, this.products);
  }

  async renderComponents() {
    this.subElements.sliderContainer.append(this.components.doubleSlider.element);
    this.subElements.sortableTable.append(this.components.sortableTable.element);
  }

  initEventListener() {
    this.subElements.sliderContainer.addEventListener('range-select', this.onRangeSelect);
    this.subElements.filterStatus.addEventListener('change', this.onStatusSelect);
    this.subElements.filterName.addEventListener('input', this.onNameSelect);
  }

  onRangeSelect = async (event) => {
    this.resetSortableTableParams();
    this.components.sortableTable.url.searchParams.set('price_gte', event.detail.from);
    this.components.sortableTable.url.searchParams.set('price_lte', event.detail.to);
    await this.components.sortableTable.loadData(this.components.sortableTable.sorted.id, this.components.sortableTable.sorted.order);
  }

  onStatusSelect = async (event) => {
    this.resetSortableTableParams();
    if (event.target.value === '') {
      this.components.sortableTable.url.searchParams.delete('status');
    } else {
      this.components.sortableTable.url.searchParams.set('status', event.target.value);
    }
    await this.components.sortableTable.loadData(this.components.sortableTable.sorted.id, this.components.sortableTable.sorted.order);
  }

  onNameSelect = async (event) => {
    this.resetSortableTableParams();
    if (event.target.value === '') {
      this.components.sortableTable.url.searchParams.delete('title_like');
    } else {
      this.components.sortableTable.url.searchParams.set('title_like', event.target.value);
    }
    await this.components.sortableTable.loadData(this.components.sortableTable.sorted.id, this.components.sortableTable.sorted.order);
  }

  resetSortableTableParams() {
    this.components.sortableTable.params = { start: 0, end: this.components.sortableTable.loadRange }
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
