import ProductFilter from '../../../components/filter/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import header from './products-header.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  endpoint = 'api/rest/products?_embed=subcategory.category';
  element;
  subElements = {};
  components = {};

  onFilter = event => {
    const url = new URL(this.endpoint, BACKEND_URL);
    const detail = event.detail;
    if (detail.title) url.searchParams.set('title_like', detail.title);
    if (detail.status) url.searchParams.set('status', detail.status);
    url.searchParams.set('price_gte', detail.price.from);
    url.searchParams.set('price_lte', detail.price.to);
    const productsContainer = new SortableTable(header, { url: url });
    this.components.productsContainer.destroy();
    this.components.productsContainer = productsContainer;
    this.subElements.productsContainer.append(productsContainer.element);
  };

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.subElements.productsFilter.addEventListener('filter', this.onFilter);
  }

  get template() {
    return `
    <div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>
      <div data-element="productsFilter" class="content-box content-box_small"></div>
      <div data-element="productsContainer" class="products-list__container">
      </div>
    </div>
    `;
  }

  initComponents() {
    const productsFilter = new ProductFilter();
    const productsContainer = new SortableTable(header, { url: this.endpoint, linksEnabled: true });
    this.components = { productsFilter, productsContainer };
  }

  async renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
