import ProductForm from '../../../components/product-form';

export default class EditProductPage {
  element;
  subElements = {};
  components = {};
  productId;

  constructor(productId = '') {
    this.productId = productId[1];
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getFormHtml();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
    await this.initComponents();
    this.renderComponents();

    return this.element;
  }

  getFormHtml() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a>
            / ${this.productId ? 'Edit' : 'Add'}
          </h1>
        </div>
        <div class="content-box" data-element="productContainer">
        </div>
      </div>`;
  }

  getSubElements() {
    const subElements = {};
    this.element.querySelectorAll('[data-element]').forEach(subElement => {
      subElements[subElement.dataset.element] = subElement;
    })
    return subElements;
  }

  async initComponents() {
    const productContainer = new ProductForm(this.productId);
    await productContainer.render();
    this.components.productContainer = productContainer;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      root.append( this.components[component].element);
    });
  }

  destroy() {
    Object.values(this.components).forEach(component => component.destroy());
  }
}
