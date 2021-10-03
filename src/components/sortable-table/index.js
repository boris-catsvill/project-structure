import Notification from '../notification/index.js';
import fetchJson from '../../utils/fetch-json.js';
import { NOTIFICATION_TYPE, BACKEND_URL } from '../../constants';

export default class SortableTable {
  element;
  subElements = {};
  pageSize = 30;

  onWindowScroll = () => {
    if (!this.isRunning && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
      this.isRunning = true;

      const start = this.data.length;
      const end = this.data.length + this.pageSize;

      this.loadData(start, end,true)
        .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show())
        .finally(() => this.isRunning = false);
    }
  }

  onPointerDown = event => {
    const column = event.target.closest('.sortable-table__cell[data-sortable]');

    if (!column) {
      return;
    }

    const toggle = {
      asc: 'desc',
      desc: 'asc'
    };

    this.sort(column.dataset.id, toggle[column.dataset.order]);
  }

  constructor(headerConfig = [], {
    url = '',
    sortLocally = false,
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    scrollable = true,
    rowUrl = ''
  } = {}) {
    this.headerConfig = headerConfig;
    this.rowUrl = rowUrl;
    this.url = new URL(url, BACKEND_URL);
    this.sortLocally = sortLocally;
    this.sorted = sorted;
    this.scrollable = scrollable;

    this.render()
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }

  sortOnClient(id, order) {
    this.sorted = {id, order};
    this.updateTable(this.sortData(id, order));
  }

  sortOnServer(id, order) {
    this.sorted = {id, order};

    this.loadData()
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onPointerDown);
    if (this.scrollable) {
      window.addEventListener('scroll', this.onWindowScroll);
    }
  }

  async render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.loadData();

    this.initEventListeners();
  }

  async loadData(start = 0, end = this.pageSize, append = false) {
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);
    this.url.searchParams.set('_start', String(start));
    this.url.searchParams.set('_end', String(end));

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);
    this.updateTable(data, append);

    this.element.classList.remove('sortable-table_loading');
  }

  setSearchParam(name, value) {
    if (value) {
      this.url.searchParams.set(name, value);
    } else {
      this.url.searchParams.delete(name);
    }
  }

  async update(searchParams = {}) {
    Object.entries(searchParams).forEach(([name, value]) => this.setSearchParam(name, value));
    await this.loadData();
  }

  updateTable(data, append = false) {
    this.updateHeader();
    this.updateBody(data, append);
  }

  updateHeader() {
    const sortableColumns = this.subElements.header.querySelectorAll('[data-sortable]');
    const sortedColumn = this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`);

    sortableColumns.forEach(column => {
      column.dataset.order = this.sorted.order;
    });

    sortedColumn.appendChild(this.subElements.arrow);
  }

  updateBody(data, append = false) {
    if (append) {
      this.data.push(...data);
      this.subElements.body.innerHTML = this.subElements.body.innerHTML.concat(this.getTableRows(data));
    } else {
      this.data = data;
      this.subElements.body.innerHTML = this.getTableRows(this.data);
    }
    if (!this.data.length) {
      this.element.classList.add('sortable-table_empty');
    } else {
      this.element.classList.remove('sortable-table_empty');
    }
  }

  get template() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerConfig.map(column => this.getHeaderCell(column)).join('')}
        </div>
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>Нет данных</div>
        </div>
      </div>
    `;
  }

  getHeaderCell({id, title, sortable}) {
    const arrow =`
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    return `
      <div class="sortable-table__cell" data-id="${id}" ${sortable ? 'data-sortable=""' : ''} data-order="${this.sorted.order}">
        <span>${title}</span>
        ${id === this.sorted.id ? arrow : ''}
      </div>
    `;
  }

  getTableRows(data) {
    return data.map(row => this.getRowTemplate(row)).join('');
  }

  getRowTemplate(row) {
    if (this.rowUrl) {
      //const id = row.id.replace(/[^A-Z0-9]+/ig, "-");
      return `<a class="sortable-table__row" href="${this.rowUrl}/${row.id}">${this.getTableRow(row)}</a>`;
    }
    else {
      return `<div class="sortable-table__row">${this.getTableRow(row)}</div>`;
    }
  }

  getTableRow(data) {
    return this.headerConfig.map(({id, template}) =>
      template ? template(data[id]) : `<div class='sortable-table__cell'>${data[id]}</div>`
    ).join('');
  }

  getSubElements(parent) {
    const result = {};

    for (const subElement of parent.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    if (this.scrollable) {
      window.removeEventListener('scroll', this.onWindowScroll);
    }
  }

  sort(id, order) {
    if (this.sortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  sortData(id, order) {
    const sortedColumn = this.headerConfig.find(column => column.id === id);
    const sortType = sortedColumn.sortType;

    const sortFunction = {
      string: (value1, value2) => value1.localeCompare(value2, ['ru', 'en'], {caseFirst: 'upper'}),
      number: (value1, value2) => value1 - value2,
      custom: sortedColumn.sortFunction
    };

    const direction = {
      asc: 1,
      desc: -1
    };

    return [...this.data].sort((value1, value2) =>
      direction[order] * sortFunction[sortType](value1[id], value2[id])
    );
  }
}
