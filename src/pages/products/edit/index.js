import ProductForm from '../../../components/product-form';

export default class EditProductPage {
  element;
  subElements = {};
  components = {};
  productId;

  constructor(productId = '') {
    this.productId = productId[1];
  }

  async initComponents() {
    const productContainer = new ProductForm(this.productId);

    await productContainer.render();

    this.components.productContainer = productContainer;
  }

  get template() {
    return `<div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">
              Products
            </a>
            / ${this.productId ? 'Edit' : 'Add'}
          </h1>
        </div>

        <!-- ProductForm component -->
        <div class="content-box" data-element="productContainer">
        </div>
      </div>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    await this.initComponents();

    this.renderComponents();

    return this.element;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements($element) {
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
