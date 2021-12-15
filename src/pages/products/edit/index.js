import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(productId) {
    this.components.productForm = new ProductForm(productId);

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

    return this.element;
  }
}
