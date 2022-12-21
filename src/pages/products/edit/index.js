import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const URLArray = window.location.href.split('/')
    const id = URLArray[URLArray.length - 1] && URLArray[URLArray.length - 1] !== 'add' ? URLArray[URLArray.length - 1]: null;

    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.productForm = new ProductForm(id);
    const productFormElement = await this.productForm.render();
    this.subElements.productFormWrapper.append(productFormElement);
    return this.element;
  }

  getTemplate() {
    return `
      <div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / Добавить
        </h1>
      </div>
      <div class="content-box">
        <div class="product-form" data-element="productFormWrapper">

        </div>
      </div>
    </div>`;
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
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
