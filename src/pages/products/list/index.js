import SortableTable from '../../../components/sortable-table/index';
import ProductInput from '../../../components/product-input/index';
import header from '../../bestsellers-header';
import getSubElements from '../../../utils/getSubElements';

export default class Page {
  element;
  subElements = {};
  components = {};

  getTemplate = () => {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box content-box_small" data-elem="contentBox"></div>
        <div data-elem="productsContainer" class="products-list__container"></div>
      </div>
    `
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = getSubElements(this.element, 'elem');
    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  initComponents() {
    this.components.sortableTable = new SortableTable(header, {
      url: 'api/rest/products',
      isLinkToProductExist: true,
    });

    this.components.productInput = new ProductInput();
  }

  async renderComponents() {
    const { element: sortableTableElement  } = await this.components.sortableTable;
    const { element: productInputElement } = this.components.productInput;

    this.subElements.productsContainer.append(sortableTableElement);
    this.subElements.contentBox.append(productInputElement);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
