import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  CHUNK_LENGTH = 30;

  sortOnClick = event => {
    const field = event.target.closest('[data-sortable="true"]');

    if (!field) return;

    field.dataset.order = field.dataset.order === 'desc' ? 'asc' : 'desc';
    this.sorted.id = field.dataset.id;
    this.sorted.order = field.dataset.order;

    this.sort(field.dataset.id, field.dataset.order);
    this.removeArrowElement();
    this.addArrowElement(field);
  }

  updateOnScroll = async event => {
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

    if (windowRelativeBottom <= document.documentElement.clientHeight && !this.loading && !this.endOfList) {
      this.begin = this.end;
      this.end += this.CHUNK_LENGTH;

      this.loading = true;

      const newData =  await this.loadData();

      if (newData.length === 0) {
        this.endOfList = true;
      } else {
        this.data = [...this.data, ...newData];
        this.subElements.body.innerHTML = this.getTableBody(this.data);
      }

      this.loading = false;
    }
  }

  resetFilters = (event) => {
    this.element.dispatchEvent(new CustomEvent('reset-filters', {
      bubbles: true,
    }));
  }

  constructor(headersConfig, {
    url = '',
    isSortLocally = false,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: `asc`,
    },
    urlSettings = {},
    isRowClickable = false,
  } = {}) {
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.urlSettings = urlSettings;
    this.begin = this.isSortLocally ? null : 0;
    this.end = this.isSortLocally ? null : this.CHUNK_LENGTH;
    this.endOfList = false;
    this.isRowClickable = isRowClickable;

    this.getTemplate();
    this.addEventListeners();
    this.render();
  }

  getTemplate() {
    const table = document.createElement('div');
    table.setAttribute('class', 'sortable-table');

    table.innerHTML = `${this.getTableHeader()}
      <div data-element="body" class="sortable-table__body"></div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products</p>
          <button type="button" class="button-primary-outline">Reset filters</button>
        </div>
      </div>`;

    this.subElements = this.getSubElements(table);
    this.element = table;
  }

  async render() {
    this.data = await this.loadData();
    this.subElements.body.innerHTML = this.getTableBody(this.data);
    this.addArrowElement(this.subElements.header.querySelector(`[data-id=${this.sorted.id}]`));
  }

  getSubElements(table) {
    return {
      header: table.querySelector(`[data-element="header"]`),
      body: table.querySelector(`[data-element="body"]`),
    }
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortOnClick);
    if (!this.isSortLocally) {
      window.addEventListener('scroll', this.updateOnScroll);
    }
    const buttonReset = this.element.querySelector('.button-primary-outline');
    buttonReset.addEventListener('click', this.resetFilters);
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.sortOnClick);
    if (!this.isSortLocally) {
      window.removeEventListener('scroll', this.updateOnScroll);
    }
    const buttonReset = this.element.querySelector('.button-primary-outline');
    buttonReset.removeEventListener('click', this.resetFilters);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderRow()}</div>`;
  }

  getHeaderRow() {
    return this.headersConfig.map(column => {
      return `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" data-order="asc">
          <span>${column.title}</span>
      </div>`;
    }).join('');
  }

  getTableBody(inputData) {
    if (!inputData || inputData.length === 0) {
      this.element.classList.add('sortable-table_empty');
      return ``;
    }
    this.element.classList.remove('sortable-table_empty');
    return this.isRowClickable ? this.getClickableRows(inputData) : this.getRegularRows(inputData);
  }

  getClickableRows(inputData) {
    return inputData.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">${this.getRowCells(item)}</a>`;
    }).join('');
  }

  getRegularRows(inputData) {
    return inputData.map(item => {
      return `<div class="sortable-table__row">${this.getRowCells(item)}</div>`;
    }).join('');
  }

  getRowCells(item) {
    return this.headersConfig.map(column => {
      return column.hasOwnProperty("template") ?
        column.template(item[column.id]) :
        `<div class="sortable-table__cell">${item[column.id]}</div>`;
    }).join('');
  }

  sort(field, order) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    const index = this.headersConfig.findIndex(obj => obj.id === field);
    const sortedArray = this.sortData(field, index, order);

    this.subElements.body.innerHTML = this.getTableBody(sortedArray);
  }

  sortData(field, index, order) {
    const directions = {
      asc: 1,
      desc: -1
    }

    const direction = directions[order];

    return [...this.data].sort((a, b) => {
      if (this.headersConfig[index].sortType === 'string') {
        return direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
      }
      return direction * (a[field] - b[field]);
    });
  }

  async sortOnServer(field, order) {
    this.begin = 0;
    this.end = this.CHUNK_LENGTH;
    this.endOfList = false;
    this.data = await this.loadData();

    this.subElements.body.innerHTML = this.getTableBody(this.data);
  }

  async loadData() {
    this.modifyURL();

    let result = [];
    this.element.classList.add(`sortable-table_loading`);

    try {
      result = await fetchJson(this.url);
    } catch(error) {

      this.element.dispatchEvent(new CustomEvent('network-error', {
        bubbles: true,
        detail: error.message
      }));
    }
    this.element.classList.remove(`sortable-table_loading`);

    return result;
  }

  modifyURL() {
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);

    if (this.begin != null && this.end != null) {
      this.url.searchParams.set('_start', this.begin);
      this.url.searchParams.set('_end', this.end);
    }

    for (const [key, value] of Object.entries(this.urlSettings)) {
      if (value === '') {
        this.url.searchParams.delete(key);
        continue;
      }
      this.url.searchParams.set(key, value);
    }
  }

  async update(settings) {
    for (const [key, value] of Object.entries(settings)) {
      this.urlSettings[key] = value;
    }

    this.begin = 0;
    this.end = this.CHUNK_LENGTH;
    this.endOfList = false;

    this.data = await this.loadData();
    this.subElements.body.innerHTML = this.getTableBody(this.data);
  }

  removeArrowElement() {
    this.subElements.header.querySelector(`[data-element="arrow"]`).remove();
  }

  addArrowElement(field) {
    field.insertAdjacentHTML('beforeend',
      `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
    this.element = null;
  }
}
