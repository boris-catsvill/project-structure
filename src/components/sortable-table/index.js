/* eslint-disable no-undef */
import fetchJson from "../../utils/fetch-json.js";

export default class SortableTable {
  static defaultSortOrder = 'desc';

  emptyTableClass = 'sortable-table_empty';
  loadingTableClass = 'sortable-table_loading';

  columnsSortTypes = new Map();

  currentSorting = {
    id: '',
    order: ''
  };

  avoidToLoadNewData = false;

  data = [];
  subElements = {};

  firstRecordToLoad = 0;
  recordsToLoad = 30;

  sortStrings = (arr, field, multiplier) => [...arr].sort((a, b) => multiplier * a[field].localeCompare(b[field], 'ru', { caseFirst: 'upper' }));

  sortNumbers = (arr, field, multiplier) => [...arr].sort((a, b) => multiplier * (a[field] - b[field]));

  onScroll = async () => {
    const windowHeight = document.documentElement.clientHeight;
    const leftToTableBottom = this.element.getBoundingClientRect().bottom;
    const loadDataAtBeforeBottom = 50;

    if ((leftToTableBottom - windowHeight < loadDataAtBeforeBottom) && !this.avoidToLoadNewData) {
      this.avoidToLoadNewData = true;

      this.firstRecordToLoad += this.recordsToLoad;

      const data = await this.loadData();

      if (data.length) {
        this.update(data, false);
      }

      this.avoidToLoadNewData = data.length < this.recordsToLoad;
    }
  }

  onSortClick = async event => {
    const column = event.target.closest('[data-id]');
    const id = column.getAttribute('data-id');
    const order = column.getAttribute('data-order');

    if (this.columnsSortTypes.get(id) && (this.currentSorting.id !== id || this.currentSorting.order === order)) {
      this.firstRecordToLoad = 0;
      await this.sort(id, !order || order === SortableTable.defaultSortOrder ? 'asc' : 'desc');
    }
  }

  constructor(
    headerConfig = [],
    {
      url = null,
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: SortableTable.defaultSortOrder
      },
      isSortLocally = false,
      clickableRow = { isRowClickable: false, href: null},
      noDataTemplate = null
    } = {}
  ) {
    this.url = typeof url === 'string' ? new URL(url, process.env.BACKEND_URL) : url;
    this.headerConfig = headerConfig;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.clickableRow = clickableRow;
    this.noDataTemplate = noDataTemplate;

    this.render();
  }

  get template() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">${this.headerElementsTemplate}</div>
        <div data-element="body" class="sortable-table__body">${this.getBodyElementsTemplate(this.data)}</div>
        <div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">${this.noDataTemplate ? this.noDataTemplate : '<div>Нет данных</div>'}</div>
      </div>
    `;
  }

  get headerElementsTemplate() {
    return this.headerConfig.map(({ id, title, sortable, sortType = null }) => {
      this.columnsSortTypes.set(id, sortType);

      return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
          <span>${title}</span>
        </div>
      `;
    }).join('');
  }

  get sortArrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  getBodyElementsTemplate(data) {
    return data.map(item => `
      <${this.clickableRow.isRowClickable ? `a href="${this.clickableRow.href}${item.id}"` : 'div'} class="sortable-table__row">
        ${this.headerConfig.map(column => column.template ? column.template(item[column.id]) : `<div class="sortable-table__cell">${item[column.id]}</div>`).join('')}
      </${this.clickableRow.isRowClickable ? 'a' : 'div'}>
    `).join('');
  }

  getSubElements(element = this.element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  async sort(id, order) {
    if (this.currentSorting.id) {
      this.subElements.header.querySelector(`[data-id=${this.currentSorting.id}]`).removeAttribute('data-order');
    }

    this.appendSortArrow(id, order);
    this.update(this.isSortLocally ? this.sortOnClient(id, order) : await this.sortOnServer(id, order));

    this.currentSorting.id = id;
    this.currentSorting.order = order;
  }

  sortOnClient(id, order) {
    const orderMultiplier = { asc: 1, desc: -1 };

    switch (this.columnsSortTypes.get(id)) {
    case 'string':
      return this.sortStrings(this.data, id, orderMultiplier[order]);
    case 'number':
      return this.sortNumbers(this.data, id, orderMultiplier[order]);
    default:
      console.warn(`Impossible to sort data with type '${this.columnsSortTypes.get(id)}'`);
    }

    return this.data;
  }

  sortOnServer(id, order) {
    return this.loadData(id, order);
  }

  setFirstRecordToLoad(value = 0) {
    this.firstRecordToLoad = value;
  }

  async loadData(id = this.currentSorting.id, order = this.currentSorting.order, startFrom = this.firstRecordToLoad, endAt = this.firstRecordToLoad + this.recordsToLoad) {
    this.element.classList.add(this.loadingTableClass);

    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', startFrom.toString());
    this.url.searchParams.set('_end', endAt.toString());
    this.data = await fetchJson(this.url);

    this.element.classList.remove(this.loadingTableClass);

    return this.data;
  }

  update(data = this.data, replaceData = true) {
    if (data.length) {
      this.subElements.body.innerHTML = replaceData ? this.getBodyElementsTemplate(data) : this.subElements.body.innerHTML + this.getBodyElementsTemplate(data);
      this.element.classList.remove(this.emptyTableClass);
    } else {
      this.element.classList.add(this.emptyTableClass);
    }
  }

  appendSortArrow(id, order) {
    const columnElement = this.subElements.header.querySelector(`[data-id=${id}]`);
    columnElement.setAttribute('data-order', order);
    columnElement.append(this.subElements.sortArrow);
  }

  async render() {
    this.element = this.getElementFromTemplate(this.template);
    this.subElements = this.getSubElements();
    this.subElements.sortArrow = this.getElementFromTemplate(this.sortArrowTemplate);

    this.initEventListeners();

    const data = await this.loadData(this.sorted.id, this.sorted.order);
    this.appendSortArrow(this.sorted.id, this.sorted.order);
    this.update(data);

    this.currentSorting = this.sorted;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);

    if (!this.isSortLocally) {
      document.addEventListener('scroll', this.onScroll);
    }
  }

  remove() {
    this.element.remove();
    document.removeEventListener('scroll', this.onScroll);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
