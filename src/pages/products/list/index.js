import ProductForm from "../../../components/product-form";
import RangeSlider from "../../../components/double-slider";
import SortableTable from "../../../components/sortable-table";
import header from './products-header';

import fetchJson from '../../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30', BACKEND_URL);
  sortableTableURL = '';
  data = [];

  async updateComponents (from, to) {
    const data = await this.loadData(from, to);

    this.element.querySelector('.sortable-table__body').innerHTML = '';

    this.sortableTableURL.searchParams.set('price_gte', from);
    this.sortableTableURL.searchParams.set('price_lte', to);

    this.components.sortableTable.update(data);

    this.renderPlaceholder(data);
  }

  async loadData(from, to) {
    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);

    const data = await fetchJson(this.url);

    return data;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  async sortByStatus(state) {
    if (state === '1') {
      this.url.searchParams.set('status', '1');
      this.sortableTableURL.searchParams.set('status', '1')

    } else if (state === '0') {
      this.url.searchParams.set('status', '0');
      this.sortableTableURL.searchParams.set('status', '0')

    } else if (state === '') {
      this.url.searchParams.delete('status');
      this.sortableTableURL.searchParams.delete('status');
    }

    const data = await fetchJson(this.url);

    this.element.querySelector('.sortable-table__body').innerHTML = '';

    this.components.sortableTable.update(data);

    this.renderPlaceholder(data);
  }

  async sortByName(value) {
    this.url.searchParams.set('title_like', value);
    this.sortableTableURL.searchParams.set('title_like', value);

    const data = await fetchJson(this.url);

    this.element.querySelector('.sortable-table__body').innerHTML = '';

    this.components.sortableTable.update(data);

    this.renderPlaceholder(data);
  }

  initComponents() {
    const rangeSlider = new RangeSlider();

    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`
    })

    this.sortableTableURL = sortableTable.url;

    this.components = {
      rangeSlider,
      sortableTable
    }

  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    })
  }

  renderPlaceholder(data) {
    const placeholder = this.element.querySelector('[data-element="emptyPlaceholder"]');
    const sortableTable = this.element.querySelector('.sortable-table');

    if (data.length === 0) {
      sortableTable.classList.add('sortable-table_empty')
      placeholder.innerHTML = this.getPlaceholderTemplate();

      const clearFiltersButton = this.element.querySelector('.button-primary-outline');
      this.clearFilters(clearFiltersButton);

    } else {
      sortableTable.classList.remove('sortable-table_empty')
      placeholder.innerHTML = '';
    }
  }

  getPlaceholderTemplate() {
    return `
    <div>
      <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
      <button type="button" class="button-primary-outline">Очистить фильтры</button>
    </div>
    `
  }

  async clearFilters(button) {
    const initialURL = new URL('api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30', BACKEND_URL)
    const placeholder = this.element.querySelector('[data-element="emptyPlaceholder"]');
    const sortableTable = this.element.querySelector('.sortable-table');
    const { filterStatus, filterName } = this.subElements;
    const { rangeSlider } = this.components;
    const from = this.element.querySelector('[data-element="from"]');
    const to = this.element.querySelector('[data-element="to"]');

    if ( button ) {
      button.addEventListener('click', async () => {
        const data = await fetchJson(initialURL);
        this.components.sortableTable.update(data);

        sortableTable.classList.remove('sortable-table_empty')
        placeholder.innerHTML = '';
        filterStatus.value = '';
        filterName.value = '';

        rangeSlider.selected.from = 0;
        rangeSlider.selected.to = 4000;
        rangeSlider.update();
        from.textContent = '$0';
        to.textContent = '$4000';

        this.url = initialURL;
        this.components.sortableTable.url = initialURL;
      })
    }
  }

  getTemplate() {
    return `
    <div class="products-list">

      <div class="content__top-panel">
        <h2 class="page-title">Товары</h2>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>

      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="rangeSlider">
            <label class="form-label">Цена:</label>
            <!-- rage-slider component -->
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
      </div>

      <div data-element="sortableTable" class="products-list__container">
        <!-- sortable-table component -->
      </div>
    </div>
    `
  }

  initEventListeners() {
    this.components.rangeSlider.element.addEventListener('range-select', event => {
      const  { from, to } = event.detail;

      this.components.sortableTable.stopFetching = false;
      this.updateComponents(from, to);
    });

    this.subElements.filterStatus.addEventListener('change', event => {

      this.sortableTableURL.searchParams.set('_start', '0');
      this.sortableTableURL.searchParams.set('_end', '30');
      this.components.sortableTable.stopFetching = false;

      this.sortByStatus(event.target.value);
    })

    this.subElements.filterName.addEventListener('input', event => {

      this.sortableTableURL.searchParams.set('_start', '0');
      this.sortableTableURL.searchParams.set('_end', '30');
      this.components.sortableTable.stopFetching = false;

      this.sortByName(event.target.value);
    })
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
}
