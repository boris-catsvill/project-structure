import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
          <a href="/products" class="link">Products</a>
          / Edit
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
    const productId = window.location.pathname.toString().slice(10);

    this.components.productFrom = new ProductForm(productId);
  }

  async renderComponents() {
    const element = await this.components.productFrom.render();

    this.element.querySelector('.content-box').append(element);
  }

  initEventListener() {
    this.element.querySelector('.product-form').addEventListener('product-updated', this.notificationProductUpdated);
  }

  notificationProductUpdated() {
    const notification = new NotificationMessage('Product updated', {
      duration: 2000,
      type: 'success'
    });

    notification.element.style.position = 'fixed';
    notification.element.style.right = '15%';
    notification.element.style.bottom = '15%';

    notification.show();
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
