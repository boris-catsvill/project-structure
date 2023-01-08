import fetchJson from '../../utils/fetch-json.js';
import { getSubElements } from '../../utils/helpers';

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {
  element;
  subElements = {};
  isSortLocally

  constructor(headersConfig, {
    isSortLocally,
    url,
    range = {
      from: null,
      to: null
    },
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    start = 1,
    step = 10,
    scroll = true,
  } = {}) {
    this.isSortLocally = isSortLocally;
    this.headers = headersConfig;
    this.range = range;
    this.sorted = sorted;
    this.start = start;
    this.step = step;
    this.end = start + step;
    this.url = new URL(url, BACKEND_URL);
    this.scroll = scroll
    this.render();
  }

  async render() {
    const table = document.createElement('div');
    table.innerHTML = this.getTable();
    this.element = table.firstElementChild;
    this.subElements = getSubElements(this.element)
    const data = await this.loadData();
    this.data = data;
    this.subElements.body.innerHTML = this.renderRows(data);
    this.subElements.header.addEventListener('pointerdown', this.clickSortEvent);
    if (this.scroll){
      window.addEventListener('scroll', this.infinityScroll);
    }
  }

  async loadData(id = this.sorted.id, order = this.sorted.order, start = this.start, end = this.end) {
     let params = {
      _sort: id,
      _order: order,
      _start: start,
      _end: end,
      _embed: 'subcategory.category',
    };
    if (this.range.from && this.range.to){
      params = {...params, ...this.range}
    }
    let query = new URLSearchParams(this.url.search)
    for (const [key, val] of Object.entries(params)){
      query.set(key, val)
    }
    this.url.search = query.toString()//new URLSearchParams(params).toString();
    this.element.classList.add('sortable-table_loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');
    return data;
  }

  infinityScroll = () => {
    const bottom = this.element.getBoundingClientRect().bottom;
    const clientHeight = document.documentElement.clientHeight;
    if (bottom < clientHeight && !this.loading) {
      this.start = this.end;
      this.end = this.start + this.step;
      this.loading = true;
      this.loadData(this.sorted.id, this.sorted.order, this.start, this.end)
        .then(data => {
          this.data = [...this.data, ...data];
          this.subElements.body.innerHTML += this.renderRows(data);
          this.loading = false;
        })
        .catch(e => {
          alert(e.message());
        });
    }
  }

  addRows(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.renderRows(data);
  }

  clickSortEvent = event => {
    const sortBy = event.target.closest('[data-sortable="true"]');
    if (sortBy) {
      const { id, order } = sortBy.dataset;
      const direction = (order && order === 'desc') ? 'asc' : 'desc';
      this.sort(id, direction);
    }
  }

  getTable() {
    return `<div class="sortable-table">
              ${this.renderHeaders()}
              ${this.renderBody()}
              <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
              <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                No products
              </div>
            </div>`;
  }

  renderHeaders() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headers.map(item => {
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
                  <span>${item.title}</span>
                  <span data-element="arrow" class="sortable-table__sort-arrow">
                    <span class="sort-arrow"></span>
                  </span>
                </div>
              `;
    }).join('')}
    </div>`;
  }

  renderBody() {
    return `<div data-element="body" class="sortable-table__body">
              ${this.renderRows(this.data)}
            </div>`;
  }

  renderRows(data = []) {
    return data.map(item => {
      return `<div class="sortable-table__row">${this.renderRow(item)}</div>`;
    }).join('');
  }

  renderRow(item) {
    const cells = this.headers.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
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
    this.clearOtherSort();
    const sortBy = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    sortBy.dataset.order = order;
    const data = this.getSortData(field, order);
    this.subElements.body.innerHTML = this.renderRows(data);
  }

  async sortOnServer(id, order) {
    this.clearOtherSort();
    const sortBy = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);
    sortBy.dataset.order = order;
    const start = 1;
    const end = 1 + this.step;
    const data = await this.loadData(id, order, start, end);
    this.subElements.body.innerHTML = this.renderRows(data);
  }

  clearOtherSort() {
    this.element.querySelectorAll('.sortable-table__cell[data-id]').forEach(column => {
      column.dataset.order = '';
    });
  }

  getSortData(field, order) {
    const column = this.headers.find(item => item.id === field);
    const direction = (order === 'asc') ? 1 : -1;
    return [...this.data].sort((a, b) => {
      if (column.sortType === 'string') {
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      } else {
        return direction * (a[field] - b[field]);
      }
    });
  }

  destroy() {
    this.element?.remove();
  }
}
