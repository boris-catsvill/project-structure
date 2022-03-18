import ProductForm from "../../../components/product-form";

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor (productId) {
    this.productId = productId;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  get template () {
    return `<div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Products</a> / Edit
        </h1>
      </div>

      <div data-element="content" class="content-box">
        <!-- product form component -->
      </div>
    </div>`;
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initComponents() {
    this.components.productFrom = new ProductForm(this.productId);
  }

  initEventListeners () {
    this.components.productFrom.element.addEventListener('product-updated', () => {
      // ToDo: show success modal
      console.log('success');
    });
  }

  async renderComponents() {
    const element = await this.components.productFrom.render();

    this.subElements.content.append(element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
