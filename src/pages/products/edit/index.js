import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};
  productId = window.location.pathname.toString().slice(10);
  isNewProduct = this.productId === 'add';

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
          <a href="/products" class="link">Products</a>
          / ${this.isNewProduct ? 'Add' : 'Edit'}
          </h1>
        </div>
        <div class="content-box">
        </div>
      </div>`;

    this.element = element.firstElementChild;

    this.initComponents();
    await this.renderComponents();

    this.initEventListener();

    return this.element;
  }

  initComponents() {
    if (this.isNewProduct) {
      this.components.productFrom = new ProductForm();
    } else {
      this.components.productFrom = new ProductForm(this.productId);
    }
  }

  async renderComponents() {
    const element = await this.components.productFrom.render();

    this.element.querySelector('.content-box').append(element);
  }

  initEventListener() {
    if (this.isNewProduct) {
      this.element.querySelector('.product-form').addEventListener('product-saved', this.notificationProductCreated);
    } else {
      this.element.querySelector('.product-form').addEventListener('product-updated', this.notificationProductUpdated);
    }
  }

  notificationProduct(message) {
    const notification = new NotificationMessage(message, {
      duration: 2000,
      type: 'success'
    });

    notification.element.style.position = 'fixed';
    notification.element.style.right = '15%';
    notification.element.style.bottom = '15%';

    notification.show();
  }

  notificationProductUpdated = () => {
    this.notificationProduct('Product updated');
  }

  notificationProductCreated = () => {
    this.notificationProduct('Product saved');
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
