import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from "../../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};

  onNotice = event => {
    console.log(event);
    const notification = new NotificationMessage(event.detail.note, {
      duration: 2000,
      type: event.detail.type
    });

    notification.show();
  };

  constructor(productId) {
    this.components.productForm = new ProductForm(productId);
    this.productId = productId;

    this.render();
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `<div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / Добавить
        </h1>
      </div>
      <div class="content-box">
      </div>
    </div>`;

    this.element = element.firstElementChild;

    this.subElements.contentBox = this.element.querySelector('.content-box');

    this.subElements.contentBox.append(await this.components.productForm.render());

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    document.addEventListener(this.productId ? 'product-updated' : 'product-saved', this.onNotice);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener(this.productId ? 'product-updated' : 'product-saved', this.onNotice);

    this.remove();
    this.element = null;
  }
}
