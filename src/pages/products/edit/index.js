import ProductForm from "../../../components/product-form/index.js";
import select from '../../../utils/select.js';
import NotificationMessage from "../../../components/notification/index.js";

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};

  url = new URL('api/rest/products', BACKEND_URL);

  getTeamplate () {
    const product = this.createProductId();
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / ${product === 'add' ? 'Add' : 'Edited'}
          </h1>
        </div>

        <div data-element="productForm" class="content-box"></div>
      </div>
    `
  }

  createProductId () {
    const href = document.location.href;
    const arr = href.split('/');
    return arr.at(-1);
  }

  async initComponents () {
    let product = this.createProductId();

    if (product === 'add') {
      product = '';
    }

    const productForm = new ProductForm(product);
    this.productForm = productForm;
    
    await productForm.render();
    this.subElements.productForm.append(productForm.element);

    if (product === '') this.subElements.productForm.querySelector('#subcategory').value = 'tovary-dlya-doma';
  }

  initEventListeners () {
    this.productForm.element.addEventListener('product-updated', (event) => {
      this.NotificationMessage({
        type: event.detail.status,
        name: event.detail.status === 'success' ? 'Товар сохранен' : 'Ошибка сохранения'
      });
    });
    this.productForm.element.addEventListener('product-saved', (event) => {
      this.NotificationMessage({
        type: event.detail.status,
        name: event.detail.status === 'success' ? 'Товар сохранен' : 'Ошибка сохранения'
      });

      document.location.pathname = `/products/${event.detail.id}`
    });
  }

  NotificationMessage (message) {
    const notification = new NotificationMessage(message.name, {
      duration: 2000,
      type: message.type
    });

    notification.show(this.subElements.productForm);
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTeamplate();

    const element = wrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements();
    select();

    await this.initComponents();
    this.initEventListeners()

    return this.element;
  }

  getSubElements () {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
}

  destroy () {
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}