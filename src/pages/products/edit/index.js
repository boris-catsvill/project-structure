import ProductForm from "../../../components/product-form/index.js";

export default class Page {
  element;
  subElements = {};
  components = {};
  productId;

  async render() {
    const pathArr = decodeURI(window.location.pathname).split('/');
    this.productId = pathArr[2];

    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  get template () {
    return `<div class="product-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / ${this.productId !== 'add' ? 'Редактировать' : 'Добавить'}
        </h1>
      </div>

      <div class="content-box">
        <div data-element="productFrom">
          <!-- product-form component -->
        </div>
      </div>
    </div>`;
  }

  async initComponents() {
    this.components.productFrom = new ProductForm(this.productId !== 'add' ? this.productId : null);
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
