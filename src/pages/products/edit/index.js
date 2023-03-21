import ProductForm from '../../../components/product-form';
import Notification from '../../../components/notification/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  inUpdate = true;
  evntSignal = new AbortController();

  constructor(match = []) {
    this.match = match;
  }

  onProductUpdate = event => {
    const notification = new Notification('Product data updated');
    notification.show();
  };

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    await this.initComponents();
    this.renderComponents();
    this.inUpdate = false;
    this.initEventListeners();
    return this.element;
  }

  async initComponents() {
    const productId = this.match[1] ? this.match[1] : false;
    this.components.productForm = new ProductForm(productId);
    await this.components.productForm.render();
  }

  get template() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Products</a> / Edit
        </h1>
      </div>
      <div class="content-box">
      <!-- ProductForm component -->
      </div>
    </div>`;
  }

  getSubElements(element) {
    const result = {};
    result.productForm = element.querySelector('.content-box');
    return result;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
      root.append(element);
    });
  }

  initEventListeners() {
    const { signal } = this.evntSignal;
    this.subElements.productForm.addEventListener('product-updated', this.onProductUpdate, {
      signal
    });
    this.subElements.productForm.addEventListener('product-saved', this.onProductUpdate, {
      signal
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    if (this.evntSignal) {
      this.evntSignal.abort();
    }
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
