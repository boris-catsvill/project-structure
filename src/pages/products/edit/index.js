import ProductForm from "../../../components/product-form/index.js";

export default class Page {
  element;
  components = {};

  constructor([,match] = []) {
    this.productId = match;
  }

  initComponents() {
    this.components.productForm = new ProductForm(this.productId);
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / ${this.productId ? 'Edit' : 'Add'}
          </h1>
        </div>
        <div class="content-box">
        </div>
      </div>
    `;

    this.element = element.firstElementChild

    this.initComponents()
    await this.renderComponents();

    return this.element;
  }

  async renderComponents() {
    await this.components.productForm.render();
    this.element.querySelector('.content-box').append(this.components.productForm.element)
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