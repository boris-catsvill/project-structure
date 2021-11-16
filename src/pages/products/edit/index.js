import Router from '@/router/index.js';
import ProductForm from '@/components/product-form/index.js';
import NotificationMessage from '@/components/notification/index.js';

const router = Router.instance();

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);

    await this.initComponent();

    this.renderComponent();
    this.initEventListeners();

    return this.element;
  }

  get productId() {
    const url = new URL(window.location.href).pathname;
    const id = url.substring(url.lastIndexOf('/') + 1);
    const excluded = ['add'];

    return excluded.includes(id) ? null : id;
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / ${this.productId ? 'Edit' : 'Add' }
          </h1>
        </div>

        <div data-element="productForm" class="content-box"></div>
      </div>
    `;
  }

  async initComponent() {
    const productForm = this.productId
      ? new ProductForm(this.productId)
      : new ProductForm();

    await productForm.render();

    this.components = {
      productForm
    };
  }

  renderComponent() {
    for (const [key, component] of Object.entries(this.components)) {
      this.subElements[key].append(component.element);
    }
  }

  destroyComponents() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  showNotification(message = '', type = 'success', duration = 2000) {
    const notification = new NotificationMessage(message, { type, duration });

    notification.show();
  }

  initEventListeners() {
    const { productForm } = this.components;

    productForm.element.addEventListener('product-saved', () => {
      this.showNotification('Product saved');

      router.navigate('/products');
    });

    productForm.element.addEventListener('product-updated', () => {
      this.showNotification('Product updated');
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.destroyComponents();
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
