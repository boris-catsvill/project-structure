import ProductForm from './../../../components/product-form';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const element = document.createElement('div');

    this.pageTitle = this.productId === 'add' ? 'Add' : 'Edit';

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.getSubElements();
    this.initComponents();
    this.renderComponents();

    return this.element;
  }

  initComponents() {
    this.components.productForm = new ProductForm(this.productId === 'add' ? '' : this.productId);
  }

  async renderComponents() {
    await this.components.productForm.render();

    const productForm = this.components.productForm;

    this.subElements.formContainer.append(productForm.element);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / ${this.pageTitle}
          </h1>
        </div>
        <div class="content-box" data-element="formContainer"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Object.keys(this.components).forEach(componentName => this.components[componentName].destroy());
    document.removeEventListener('clear-data', this.clearData);
  }
}
