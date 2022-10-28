import ProductForm from '../../../components/product-form';

export default class EditProductPage {
  element;
  subElements = {};
  components = {};
  productId;

  constructor(productId = '') {
    this.productId = productId;
  }

  async renderComponents() {
    const { productContainer } = this.subElements;

    this.productFrom = new ProductForm(this.productId);

    await this.productFrom.render();

    productContainer.append(this.productFrom.element);
  }

  get template() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">
            Products
          </a>
          / ${this.productId ? 'Edit' : 'Add'}
        </h1>
      </div>
      <div class="content-box" data-element="productContainer">
        <!-- product-form component -->
      </div>
    </div>
    `;
  }

  async render() {
    const pathname = window.location.pathname;

    if (!pathname.includes('/products/add')) {
      this.productId = pathname.substring(10, pathname.length);
    }

    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    await this.renderComponents();

    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element; 
      result[name] = subElement;
    }
    return result;
  }

  remove() {
    if (this.element) {
      this.removeListeners();
      this.element.remove();
    }
  }
    
  destroy() {
    this.element.remove();
  }
}