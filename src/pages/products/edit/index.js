import ProductForm from '../../../components/product-form';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(match) {
    const pathname = match[0].split('/').pop();
    this.productId = !pathname || pathname === 'add' ? undefined : pathname;
  }

  initComponents() {
    const productForm = new ProductForm(this.productId);
    this.components = { productForm }
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / Добавить
          </h1>
        </div>
        <div class="content-box" data-element='productForm'></div>
      </div>
    `;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    await this.components.productForm.render();
    this.subElements.productForm.append(this.components.productForm.element);
    return this.element;
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
}
