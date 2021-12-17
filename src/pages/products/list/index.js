import SortableTable from '../../../components/sortable-table/index.js';
import InlineForm from "../../../components/inline-form";
import header from './products-header.js';
import fetchJson from "../../../utils/fetch-json";

const BACKEND_URL = 'https://course-js.javascript.ru/';
const MIN_PRICE = 0;
const MAX_PRICE = 4000;

export default class Page {
  element;
  subElements = {};
  components = {};

  onFilterSelect = event => {
    const filter = event.detail;
    this.components.sortableTable.filter(filter);
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

    await this.initComponents();
    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  async initComponents() {
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

    const subcategoryItem = header.find(item => item.id === 'subcategory');

    if (subcategoryItem) {
      subcategoryItem.template = data => {
        return `<div class="sortable-table__cell">
          <span data-tooltip='
        <div class="sortable-table-tooltip">
          <span class="sortable-table-tooltip__category">${data.category.title}</span> /
          <b class="sortable-table-tooltip__subcategory">${data.title}</b>
        </div>'>${data.title}</span>
          </div>`;
      };
    }

    const productsUrl = new URL('api/rest/products', BACKEND_URL);
    productsUrl.searchParams.set('_embed', 'subcategory.category');

    this.components.sortableTable = new SortableTable(header, {
      url: productsUrl.toString(),
      editUrl: 'products',
      step: 30,
      start: 0,
      end: 30
    });
  }

  async renderComponents() {
    this.subElements.contentBox = this.element.querySelector('.content-box');
    this.subElements.contentBox.append(this.components.inlineForm.element);
    this.subElements.productsContainer = this.element.querySelector('.products-list__container');
    this.subElements.productsContainer.append(this.components.sortableTable.element);
  }

  initEventListeners() {
    document.addEventListener('filter-select', this.onFilterSelect);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
