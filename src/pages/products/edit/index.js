import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor({ id = '' } = {}) {
    this.id = id;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
    this.initComponents();
    this.renderComponents();
    return this.element;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initComponents() {
    const form = this.id === 'add' ? new ProductForm() : new ProductForm(this.id);
    this.components = { form };
  }

  async renderComponents() {
    const renderPromises = Object.values(this.components).map(component => component.render());
    await Promise.all(renderPromises);

    Object.keys(this.components).map(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    });
  }

  get template() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / Добавить
        </h1>
      </div>
      <div class="content-box">
        <div class="product-form" data-element="form"></div>
      </div>
    </div>
    `;
  }

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
