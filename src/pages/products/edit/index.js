import ProductForm from "../../../components/product-form/index.js";

export default class Page {
  element;
  components = {};

  constructor([,match] = []) {
    this.productId = match;
    this.components.productForm = new ProductForm(this.productId);
    this.components.productForm.render();
  }

  async render() {
    this.element = document.createElement('div');
    this.element.classList.add('products-edit');
    this.element.innerHTML = `
    <div class="content__top-panel">
      <h1 class="page-title">
        <a href="/products" class="link">Products</a> / ${this.productId ? 'Edit' : 'Add'}
      </h1>
    </div>
    <div class="content-box">
    </div>`;

    this.element.querySelector('div.content-box').append(this.components.productForm.element);
    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove;
    }
    this.element = null;
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
    this.components = null;
  }
}
