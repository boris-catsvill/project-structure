import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification';

export default class Page {
  element;
  components = {};
  subElements = {};

  constructor(match) {
    this.productId = match[1];
  }

  getTemplate() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / ${this.productId ? 'Edit' : 'Add'}
          </h1>
        </div>
        <div class="content-box">
          <div class="product-form" data-element="productForm">
            </div>
        </div>
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
    const productForm = new ProductForm(this.productId);

    this.components = {
      productForm,
    }
  }

  async getComponents() {
    const productForm = await this.components.productForm.render();

    this.subElements.productForm.append(productForm);
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    await this.getComponents();
    this.initEventListeners();
    
    return this.element;
  }

  initEventListeners() {
    const  { productForm } = this.components;

    productForm.element.addEventListener('product-updated', (event) => {
      this.showNotification({
        type: event.detail.status,
        text: event.detail.status === 'success' ? 'Product was updated' : 'Product update error',
      });
    });

    productForm.element.addEventListener('product-saved', (event) => {
      this.showNotification({
        type: event.detail.status,
        text: event.detail.status === 'success' ? 'Product was saved' : 'Product save error'
      });
    });
  }

  showNotification(message) {
    const notification = new NotificationMessage(message.text, {
      duration: 2000,
      type: message.type
    });

    notification.show(this.components.productForm.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.components = {};
    Object.values(this.components).forEach((component) => {
      component.destroy();
    });
  }

}
