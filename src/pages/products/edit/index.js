import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js';

export default class Page {
  element;
  components = {};

  onProductSaved = () => {
    new NotificationMessage('Товар добавлен');
  };

  onProductUpdated = () => {
    new NotificationMessage('Товар сохранён');
  };

  constructor(id = null) {
    this.components['productForm'] = new ProductForm(id);
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / Редактировать
          </h1>
        </div>
        <div class="content-box">
          <div class="product-form"></div>
        </div>
      </div>
    `;
  }

  async renderComponents() {
    this.element.querySelector('.content-box').append(await this.components['productForm'].render());
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  async render() {
    this.element = this.getElementFromTemplate(this.template);
    await this.renderComponents();

    this.initEventListeners();
    return this.element;
  }

  initEventListeners() {
    const productForm = this.components['productForm'].element;
    productForm.addEventListener('product-saved', this.onProductSaved);
    productForm.addEventListener('product-updated', this.onProductUpdated);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    Object.values(this.components).forEach(component => component.destroy());
  }
}
