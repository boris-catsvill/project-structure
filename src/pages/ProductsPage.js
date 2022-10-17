import SortableTable from '../components/SortableTable.js';
import header from '../store/product-header.js';

export default class ProductsPage {

  subElements = {}

  constructor({ mainClass, range, url }) {

    const [path, backendURL] = url;

    this.mainClass = mainClass;
    this.path = path;
    this.backendURL = backendURL;

    this.range = {
      from: new Date(range.from),
      to: new Date(range.to)
    };

    this.inputData = [header, {
      range: this.range,
      url: (new URL(this.path, this.backendURL)).toString(),
      isSortLocally: false,
      showingPage: 'ProductsPage',
    }];

    this.Constructor = SortableTable;

    this.render();
  }

  get ProductsElement() {
    const wrapper = document.createElement('div');
    const products = `
        <div class="products-list">
            <div class="content__top-panel">
                <h1 class="page-title">Товары</h1>
                <a href="/products/add" class="button-primary" data-element="addProductBtn">Добавить товар</a>
            </div>
            <div data-element="productsContainer" class="products-list__container"></div>
        </div>`;
    wrapper.innerHTML = products;
    return wrapper.firstElementChild;
  }

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  async render() {
    this.element = this.ProductsElement;
    this.setSubElements();

    const { productsContainer } = this.subElements;

    this.wrapperOfElementHTML = new this.Constructor(...this.inputData);
    productsContainer.append(this.wrapperOfElementHTML.element);

    return this.element;
  }

  remove() {
    this.element?.remove();
    this.element = null;
  }

  destroy() {
    this.wrapperOfElementHTML.destroy();
    this.remove();
  }
}

