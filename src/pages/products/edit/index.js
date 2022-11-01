import ProductForm from '../../../components/product-form/index.js'

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');
    element.className = 'products-edit';
    this.createInstanceOfProductForm();

    const productId = this.getProductId()

    await this.components.productForm.render();

    element.innerHTML = `
    <div class="content__top-panel">
        <h1 class="page-title">
        <a href="/products" class="link">Products / </a>
            ${productId === 'add' ? 'Add' : 'Edit'}
        </h1>
    </div>
`;

    this.getSubElements(element);
    this.element = element;
    this.element.append(this.components.productForm.element);

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    for (const item of elements) {
      this.subElements[item.dataset.elem] = item;
    }
  }

  getProductId() {
    const url = new URL(window.location.href);
    return url.pathname.split('/').at(-1);
  }

  createInstanceOfProductForm() {
    const productId = this.getProductId();
    this.components.productForm = productId === 'add' ? new ProductForm() : new ProductForm(productId);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    Object.values(this.components).forEach(item => item.destroy());
  }
}
