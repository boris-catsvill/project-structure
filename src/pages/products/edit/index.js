import ProductForm from "../../../components/product-form";

export default class Page {
  productId = null; // = '101-planset-lenovo-tab-p10-tb-x705l-32-gb-3g-lte-belyj';

  constructor(params = null) {
    this.productId = params[1]
    //console.log(params);
  }

  async initComponents() {
    const productForm = new ProductForm(this.productId);
    await productForm.render();
    this.productForm = productForm;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    await this.initComponents();

    this.subElements.containerForm.append(this.productForm.element);

    return this.element;
  }

  getTemplate() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
        <a href="/products" class="link">Товары</a> / ${(this.productId) ? 'Редактировать' : 'Добавить'}
        </h1>
      </div>
      <div class="content-box" data-element="containerForm">
      </div>
    </div>
    `
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
    this.element.remove();
  }

  destroy() {
    this.productForm.destroy();
    this.remove();
  }
}
