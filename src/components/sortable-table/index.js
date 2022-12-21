import fetchJson from './../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  constructor(headersConfig = [], {
    url = '',
    isSortLocally = false
  } = {}) {
    this.loadKey = true;
    this._start = 0;
    this._end = 30;
    this._sort = 'title';
    this._order = 'asc';
    this.isSortLocally = isSortLocally;
    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.render();
  }

  async loadData(_start, _end, _sort, _order) {
    this.url.searchParams.set('_start', _start);
    this.url.searchParams.set('_end', _end);
    this.url.searchParams.set('_sort', _sort);
    this.url.searchParams.set('_order', _order);
    const url = this.url.href;
    return await fetchJson(url);
  }
  async reRenderBody(id='title', order='asc') {
    this.data = await this.loadData(this._start, this._end, id, order);
    if (!this.data) {
      // this.sortableTable.classList.add('sortable-table_empty');
    } else {
      // this.sortableTable.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.getBodyTemplate();
    }
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    await this.reRenderBody();
    this.initEventListeners();
  }
  getTemplate() {
    return `
      <div class="sortableTable" data-element="sortableTable">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderTemplate()}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyTemplate()}
      </div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
      </div>
    `;
  }

  getHeaderTemplate() {
    return this.headersConfig.map(item => {
      const arrowTemplate = `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      `;
      const arrow = item.sortable ? arrowTemplate : '';
      return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="asc">
            <span>${item.title}</span>
            ${arrow}
        </div>
      `;
    }).join('');
  }
  getBodyTemplate() {
    const ids = this.headersConfig.map(x => x.id);
    if (!this.data) { return ''; }
    return this.data.map(item => {
      const tableCells = ids.map(id => {
        const headerItem = this.headersConfig.find(x => x.id === id);
        if (headerItem.hasOwnProperty('template') && item[id]) {
          return headerItem.template(item[id]);
        } else {
          return `<div class="sortable-table__cell">${item[id]}</div>`;
        }
      }).join('');
      return `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${tableCells}
      </a>
    `;
    }).join('');
  }
  get sortableTable() {
    return document.querySelector('.sortable-table');
  }
  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortClick);
    window.addEventListener('scroll', this.infinityScroll);
  }
  infinityScroll = (event) => {
    if (this.element.getBoundingClientRect().bottom < document.documentElement.clientHeight && this.loadKey && !this.isSortLocally) {
      this.loadKey = false;
      this._end = this._end + 30;
      this.loadData(this._start, this._end, this._sort, this._order).then((res) => {
        if (res) {
          this.data = res;
          this.subElements.body.append = this.getBodyTemplate();
        } else {
          this.sortableTable.classList.add('sortable-table_empty');
        }
        document.dispatchEvent(new CustomEvent('table-update'));
        this.loadKey = true;
      });
    }
  }
  sortClick = (event) => {
    const headerItem = event.target.closest('[data-sortable="true"]');
    if (headerItem) {
      const { id } = headerItem.dataset;
      let { order } = headerItem.dataset;
      // TODO понять как надо разворачивать сортировку
      this._sort = id;
      this._order = (this._order === 'asc') ? 'desc' : 'asc';

      if (this.isSortLocally) {
        this.sortOnClient(this._sort, this._order);
      } else {
        this.sortOnServer(this._sort, this._order);
      }
      this.subElements.body.innerHTML = this.getBodyTemplate();
    }
  }
  async sortOnServer (id, order) {
    await this.reRenderBody(id, order);
  }
  sortOnClient(id, order) {
    const sortType = this.headersConfig.find(x => x.id === id).sortType;
    this.data = (sortType === 'string') ? this.sortStrings(this.data, id, order) : this.sortNumbers(this.data, id, order);
  }
  sortStrings(arr, field, order) {
    const sortState = {
      'asc': 1,
      'desc': -1
    };
    const sortDirection = sortState[order];
    return [...arr].sort((a, b) => {
      return sortDirection * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
    });
  }
  sortNumbers(arr, field, order) {
    const sortState = {
      'asc': 1,
      'desc': -1
    };
    const sortDirection = sortState[order];
    return [...arr].sort((a, b) => {
      return sortDirection * (a[field] - b[field]);
    });
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
    this.subElements.header.removeEventListener('pointerdown', this.sortClick);
    window.removeEventListener('scroll', this.infinityScroll);
  }
}
