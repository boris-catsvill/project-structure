import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.sortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;


      // для успешной работы скролла при работе на странице /products this.input, this.status, this.rangeSelect
      const data = await this.loadData(
        id, order, this.start, this.end, this.input, this.status, this.rangeSelect);
      this.update(data);

      this.loading = false;
    }
  };



  onReset = event => {
    event.preventDefault();
    this.dispatchEvent('reset-filter');
    this.element.classList.remove('sortable-table_empty');
  }

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder, 1, 1 + this.step);
      }
    }
  };


  onProductForm = event => {
    if (event.currentTarget.closest("[data-sales]")) return null;
    const item = event.target.closest("[data-id]");
    history.pushState({ id: item.dataset.id }, '', `products/${item.dataset.id}`);
    history.go();
  }

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step,

    // products page parametrs
    input = null,
    status = null,
    rangeSelect = {}
  } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.input = input;
    this.status = status;
    this.rangeSelect = rangeSelect;

    this.render();
  }

  async render() {
    const { id, order } = this.sorted;
    const element = document.createElement('div');
  
    element.innerHTML = this.getTable();
    this.element = element.firstElementChild; 

    this.subElements = this.getSubElements();
   
    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData(id, order, start = this.start, end = this.end, input = null, status = null, rangeSelect = {}) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    // для успешной работы скролла при работе на странице /products
    if (input !== null) this.url.searchParams.set('title_like', input);
    if (status !== null) this.url.searchParams.set('status', status);
    if (Object.values(rangeSelect).length > 0) {
      this.url.searchParams.set('price_gte', rangeSelect.from);
      this.url.searchParams.set('price_lte', rangeSelect.to);
    }

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url.toString());

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  addRows(data) {

    if (!data.length) {
      this.element.classList.add('sortable-table_empty');
    }


    this.data = data;
    this.subElements.body.innerHTML = this.getTableRows(data);

  }

  dispatchEvent(type) {
    this.element.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
    }))
  }

  update(data) {
    const rows = document.createElement('div');
    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);
    this.subElements.body.append(...rows.childNodes);

  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => `
    <div class="sortable-table__row">
      ${this.getTableRow(item, data)}
    </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({ id, template }) => {
      // сразу деструктуризация map(item) 
      return {
        id,
        template
      };
    });
    // console.log(cells);
    return cells.map(({ id, template }) => {
      // console.log(item, id);


      // item.id - это в хидере header data.id то есть всегда обращение к id-ку в data
      // а вот item[id] это не обращение по айдишнику а по ЗНАЧЕНИЯ айдишника. в id: title следовательно обращение
      // data.title ВАЖНО!!!

      return template
        ? template(item[id])
        : `<div class="sortable-table__cell" data-id="${item.id}">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
      <div class="sortable-table" data-element="sortableTable">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
        Не найдено товаров удовлетворяющих выбранному критерию
        <button type="button" data-element="resetButton" class="button-primary-outline">Очистить фильтры</button></div>
    </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      </div>`;
  }

  initEventListeners() {
    const { resetButton, header, body } = this.subElements;

    header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);
    body.addEventListener('pointerdown', this.onProductForm);

    resetButton.addEventListener('click', this.onReset);
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(id, order, start, end) {
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const { sortType, customSorting } = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const item of elements) {
      this.subElements[item.dataset.element] = item;
    }

    return this.subElements;

  }


  removeEventListener() {
    this.removeEventListener('pointerdown', this.onSortClick);
    this.removeEventListener('scroll', this.onWindowScroll);
    this.removeEventListener('pointerdown', this.onProductForm);

    this.removeEventListener('submit', this.onReset);
  }

  remove() {
    this.element.remove();
    document.removeEventListener('scroll', this.onWindowScroll);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

