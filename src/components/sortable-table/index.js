import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  element;
  subElements = {};

  constructor(headersConfig = [], {
    url = '',
    isSortLocally = false,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc',
    },
    templateTableRow = (id, html) => {
      return `
        <div class="sortable-table__row">
          ${html}
        </div>
      `
    }
  } = {}) {
    this.headersConfig = headersConfig;

    this.url = new URL(url, process.env.BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    
    this.step = 30;
    this.start = 0;
    this.end = this.start + this.step;
    
    this.data = [];
    this.loadingData = false;

    this.templateTableRow = templateTableRow;

    this.render();

    this.controller = new AbortController();
    this.controllerSignal = this.controller.signal;
  }

  async update() {
    const data = await this.loadData();
    this.data = data;
    this.addedDataRows(data);
  }

  async loadData(id = this.sorted.id, order = this.sorted.order) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.end);

    this.element.classList.add('sortable-table_loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  addEventListeners() {
    const columns = this.subElements.header;
    columns.addEventListener('pointerdown', this.sort);
    document.addEventListener('scroll', this.onScroll, {signal: this.controllerSignal});

    const emptyElement = this.subElements.emptyPlaceholder.querySelector('.button-primary-outline');
    emptyElement.addEventListener('pointerdown', () => {
      this.dispatchEvent();
    });
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('button-reset', {
      bubbles: true,
    }));
  }

  onScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();

    if (bottom < document.documentElement.clientHeight && !this.loadingData && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loadingData = true;

      const data = await this.loadData();
      
      this.data = [...this.data, ...data];
      const newDataRows = document.createElement('div');
      newDataRows.innerHTML = this.getTableBodyRows(data);
      this.subElements.body.append(...newDataRows.childNodes);

      this.loadingData = false;
    }
  }

  sort = event => {
    const sortedNow = event.target.closest('[data-sortable]');

    if (sortedNow.dataset.sortable === 'true') {
      const order = sortedNow.dataset.order;
      const id = sortedNow.dataset.id;
      const switchedOrder = (order === 'asc') ? 'desc' : 'asc';
      this.sorted.id = id;
      this.sorted.order = switchedOrder;

      sortedNow.dataset.order = switchedOrder;

      const arrow = sortedNow.querySelector('.sortable-table__sort-arrow');
      if(!arrow) {
        sortedNow.append(this.subElements.arrow);
      }

      if (this.isSortLocally) {
        this.sortOnClient(id, switchedOrder);
      } else {
        this.sortOnServer(id, switchedOrder);
      }
    }
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);
    this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  async sortOnServer(id, order) {
    this.start = 0;
    this.end = this.start + this.step;
    const sortedData = await this.loadData(id, order);

    this.addedDataRows(sortedData);
  }

  sortData(field, order) {
    if (order !== 'asc' && order !== 'desc') {
      console.error('sort type is incorrect');
      return;
    }

    const newData = [...this.data];
    const { sortType } = this.headersConfig.find(item => item.id === field);

    let sortProp = 1;
    if (order === 'desc') sortProp = -1;

    return newData.sort((a, b) => {
      if (sortType === 'number')
        return sortProp * (a[field] - b[field]);
      if (sortType === 'string')
        return sortProp * a[field].localeCompare(b[field], ['ru', 'en']);
      throw new Error('Unknown sort type');
    });
  }

  async render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    const data = await this.loadData();

    this.addedDataRows(data);
    this.addEventListeners();
  }

  addedDataRows(data) {
    if (data.length) {
      this.data = data;
      this.subElements.body.innerHTML = this.getTableBodyRows(data);
      this.element.classList.remove('sortable-table_empty');
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  getTemplate() {
    return `
      <div class="sortable-table sortable-table_loading">
        ${this.getTableHeader()}
        ${this.getTableBody()}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
            <button type="button" class="button-primary-outline">Очистить фильтры</button>
          </div>
        </div>
      </div>
    `
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map(item => this.getTableHeaderRow(item)).join('')}
      </div>
    `
  }

  getTableHeaderRow(item) {
    const order = this.sorted.id === item.id ? this.sorted.order : 'asc';
    const dataOrder = item.sortable ? `data-order="${order}"` : '';

    return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" ${dataOrder}>
        <span>${item.title}</span>
        ${this.sorted.id === item.id
          ? `<span data-element="arrow" class="sortable-table__sort-arrow">
               <span class="sort-arrow"></span>
             </span>`
          : ''
        }
      </div>
    `
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableBodyRows(this.data)}
      </div>
    `
  }

  getTableBodyRows(data) {
    return data.map(item => {
      const id = item.id;
      const html = this.getTableBodyRow(item);

      return this.templateTableRow(id, html);
    }).join('');
  }

  getTableBodyRow(item) {
    return this.headersConfig.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join('');
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.controller.abort();
  }
}
