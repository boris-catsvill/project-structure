import ProductForm from '../../../components/product-form/index.js';

import fetchJson from '../../../utils/fetch-json.js';
export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    this.id = this.getId();
    console.log(this.id);
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  initComponents() {
    this.components.productForm = new ProductForm(this.id);
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getId() {
    const path = window.location.pathname.split('/');
    return path[path.length - 1];
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h2 class="page-title">
            <a href="/products" class="link">Товары</a> / ${
              this.id === 'add' ? 'Добавить' : 'Редактировать'
            }
          </h2>
        </div>

        <div class="content-box">
          <div class="product-form">
            <form data-element="productForm">
            </form>
          </div>
        </div>
      </div>
    `;
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
