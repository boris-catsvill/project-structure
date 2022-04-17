import ProductForm from '../../../components/product-form'

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();


    return this.element;
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / Редактировать
          </h1>
        </div>
        <div class = "content-box" data-element = "productForm">

        <!-- productForm -->

        </div>
      </div>

    `
  }

  initComponents() {

    const productForm = new ProductForm(
      window.location.pathname.substring(10) !== "add"
        ? window.location.pathname.substring(10)
        : ""
    );

    this.components = {
      productForm
    };
  }

  async renderComponents () {
    await this.components.productForm.render();
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];

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
    this.element = null;
    this.subElements = {}
  }

}
