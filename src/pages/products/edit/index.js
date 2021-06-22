import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    console.log(window.location);
    const url = new URL(window.location);
    const result = /^\/products\/([\w()-]+)$/.exec(url.pathname);
    if (Array.isArray(result) && result.length > 1) {
      this.productId = result[1];
    }
  }

  get template() {
    return `<div class='products-edit'>
      <div class='content__top-panel'>
         <h2 class='page-title'>
         <a href='/products' class='link'>Товары</a> / Редактировать
</h2>
         </div>
         <div class='content-box'>
         <div class='product-form'></div>
</div>
</div>`;
  }

  async render() {
    const container = document.createElement('div');
    this.productForm = new ProductForm(this.productId);

    container.innerHTML = this.template;
    const formContainer = container.querySelector('.product-form');
    formContainer.append(this.productForm.element);

    this.element = container.firstElementChild;
    return this.element;
  }
}
