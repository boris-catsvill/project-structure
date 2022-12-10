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
                  <input type="text" data-elem="filterName" class="form-control" placeholder="Name product">
                </div>
                <div class="form-group" data-element="sliderContainer">
                  <label class="form-label">Price:</label>
                  <!-- double-slider component -->
                </div>
                <div class="form-group">
                  <label class="form-label">Status:</label>
                  <select class="form-control" data-elem="filterStatus">
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
      url: `api/rest/products`,
    };
    this.components.sortableTable = new SortableTable(header, this.products);
  }

  async renderComponents() {
    this.subElements.sliderContainer.append(this.components.doubleSlider.element);
    this.subElements.sortableTable.append(this.components.sortableTable.element);
  }

  initEventListener() {
    //this.element.querySelector('.product-form').addEventListener('product-updated', this.notificationProductUpdated);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
