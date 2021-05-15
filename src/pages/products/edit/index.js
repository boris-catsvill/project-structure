import ProductForm from "../../../components/product-form-custom";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div>
        <h1>List page</h1>
      </div>`;

    this.element = element.firstElementChild;

    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  initComponents() {
    const productId = '101-planset-lenovo-tab-p10-tb-x705l-32-gb-3g-lte-belyj';

    this.components.productFrom = new ProductForm(productId);
  }

  async renderComponents() {
    await this.components.productFrom.render();
    const element = await this.components.productFrom.element;
    console.log(element);
    this.element.append(element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
