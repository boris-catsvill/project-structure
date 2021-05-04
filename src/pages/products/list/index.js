import SortableTable from '../../../components/sortable-table/index.js';
import FilterForm from '../../../components/filter-form/index.js';
import header from './header-list.js';

const BACKEND_URL = process.env.BACKEND_URL;

import fetchJson from '../../../utils/fetch-json.js';

export default class ProductsPage {
  element;
  subElements = {};
  components = {};

  sliderFrom = 0;
  sliderTo = 4000;

  constructor() {
    this.initComponents();
    this.initEventListeners();
  }

  get getTemplate() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div data-element="filterForm">
        </div>
        <div class="products-list__container">
          <div data-element="sortableTable"></div>
        </div>
      </div>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    const subElementsFields = Object.keys(this.subElements);

    for (const index in subElementsFields) {
      const elementField = subElementsFields[index];

      this.subElements[elementField].append(this.components[elementField].element);
    }

    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const filterForm = new FilterForm({
      sliderMin: this.sliderFrom,
      sliderMax: this.sliderTo,
      sliderFormat: value => '$' + value,
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
      sorted: {
        id: "title",
        order: "asc",
      }
    });

    this.components = {
      filterForm,
      sortableTable
    };
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  async updateComponents(detail, type) {
    const { sortableTable } = this.components;
    const params = {
      from: this.sliderFrom,
      to: this.sliderTo,
    }

    switch (type) {
      case 'change-name':
        params.title = detail;
        break;
      case 'change-status':
        params.status = detail;
        break;
      case 'range-select':
        params.from = detail.from;
        params.to = detail.to;
        break;
    }

    const url = new URL(`${BACKEND_URL}api/rest/products?_embed=subcategory.category`);

    url.searchParams.set('price_gte', params.from);
    url.searchParams.set('price_lte', params.to);

    if (params.title) {
      url.searchParams.set('title_like', params.title);
    }
    if (params.status) {
      url.searchParams.set('status', params.status);
    }

    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('_start', 0);
    url.searchParams.set('_end', 30);

    sortableTable.element.classList.add('sortable-table_loading');

    const data = await fetchJson(url.toString());

    sortableTable.element.classList.remove('sortable-table_loading');

    if (data.length) {
      sortableTable.addRows(data);
    } else {
      sortableTable.element.classList.add('sortable-table_empty');
    }
  }

  initEventListeners() {
    const { filterForm, sortableTable } = this.components;

    const onUpdatePage = (event) => {
      this.updateComponents(event.detail, event.type);
    }

    filterForm.element.addEventListener('change-name', onUpdatePage);
    filterForm.element.addEventListener('change-status', onUpdatePage);
    filterForm.element.addEventListener('range-select', onUpdatePage);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}