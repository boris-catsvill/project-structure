import SortableTable from '../../../components/sortable-table/index.js';
import InlineForm from "../../../components/inline-form";
import header from './products-header.js';

const MIN_PRICE = 0;
const MAX_PRICE = 4000;

export default class Page {
  element;
  subElements = {};
  components = {};

  onFilterSelect = event => {
    const filter = event.detail;
    this.subElements.sortableTable.filter(filter);
  };

  get template() {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Товары</h1>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>
      <div class="content-box content-box_small"></div>
      <div data-elem="productsContainer" class="products-list__container">
    </div>`
  };

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.initComponents();
    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const formatValue = value => '$' + value;
    const selected = {
      from: MIN_PRICE,
      to: MAX_PRICE
    };
    this.components.inlineForm = new InlineForm(
      { filterName: '',
        rangeConfig: {
        min: MIN_PRICE,
        max: MAX_PRICE,
        formatValue,
        selected
      },
        filterStatus: '' });

    this.components.sortableTable = new SortableTable(header, {
      url: 'api/rest/products'
    });
  }

  async renderComponents() {
    this.subElements.contentBox = this.element.querySelector('.content-box');
    this.subElements.contentBox.append(this.components.inlineForm.element);
    this.subElements.productsContainer = this.element.querySelector('.products-list__container');
    this.subElements.productsContainer.append(this.components.sortableTable.element);
  }

  initEventListeners() {
    this.components.sortableTable.element.addEventListener('filter-select', this.onFilterSelect);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
