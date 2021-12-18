import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js';

export default class Page {
  subElements = {};
  components = {};
  currentLocation = window.location.pathname;

  getTemplate() {
    return `
      <div class='products-edit'>
        <div class='content__top-panel'>
          <h1 class='page-title'>
            <a href="/products" class="link">Products</a>
            / ${this.currentLocation === '/products/add' ? 'Add' : 'Edit'}
          </h1>
        </div>
        <div data-element='productForm' class='content-box'></div>
      </div>
    `
  }

  async initialize() {
    if (this.currentLocation === '/products/add') {
      this.components = { productForm: new ProductForm(null) }
    }
    else {
      const pathArr = this.currentLocation.split('/');
      const productId = pathArr[pathArr.length - 1];
      this.components = { productForm: new ProductForm(productId) }
    }
    await this.components.productForm.render();
    this.renderComponents();
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    await this.initialize();
    this.attachEventListeners();
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accumulator, subElement) => {
      accumulator[subElement.dataset.element] = subElement;
      return accumulator;
    }, {})
  }

  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const container = this.subElements[component];
      const { element } = this.components[component];
      container.append(element);
    })
  }

  productEditHandler = () => {
    if (this.currentLocation === '/products/add') {
      const notificationMessage = new NotificationMessage('Product Added', {
        duration: 10000,
        type: 'success'
      })
      notificationMessage.show();
    } else {
      const notificationMessage = new NotificationMessage('Product Saved', {
        duration: 10000,
        type: 'success'
      })
      notificationMessage.show();
    }
  }

  attachEventListeners() {
    if (this.currentLocation === '/products/add') {
      this.components.productForm.element
        .addEventListener('product-saved', this.productEditHandler);
    }
    this.components.productForm.element
      .addEventListener('product-updated', this.productEditHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
    this.subElements = {};
  }
}
