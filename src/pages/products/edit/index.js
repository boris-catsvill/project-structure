import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  components = {};

  constructor() {
    this.initComponents();
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

  initComponents() {
    this.components['productForm'] = new ProductForm();
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
    return this.element;
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
