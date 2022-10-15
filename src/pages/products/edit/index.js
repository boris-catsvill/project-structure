import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.productId = '';
  }

  getComponents() {
    const productForm = new ProductForm(this.productId)

    this.components.productForm = productForm;
    this.insertComponents();
  }

  insertComponents() {
    for (const component in this.components) {
      const subElement = this.subElements[component];
      const { element } = this.components[component];
      subElement.append(element);
    }
  }

  getProductId() {
    const path = window.location.pathname.split('/');
    return path[path.length - 1] === 'add' ? '' : path[path.length - 1];
  }

  async render() {
    this.productId = this.getProductId();

    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    await this.getComponents();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / ${this.productId ? 'Редактировать' : 'Добавить'}
          </h1>
        </div>
        <div class="content-box">
          <div class="product-form" data-element="productForm">
          </div>
        </div>
      </div>
    `;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};

    for (const component of Object.keys(this.components)) {
      this.components[component].destroy();
    }

    this.components = {};
  }
}
