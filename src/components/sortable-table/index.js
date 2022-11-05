import fetchJson from '../../utils/fetch-json.js';

//const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 30;
  start = 0;
  end = this.start + this.step;
  from = new Date(new Date().setMonth(new Date().getMonth() - 1));
  to = new Date();

  constructor(headersConfig = [], {
    searchParams = {},
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    isOnWindowScroll = true,
    isProductLink = false
  } = {}) {

    this.searchParams = searchParams;
    this.headersConfig = headersConfig;
    this.url = url;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.isOnWindowScroll = isOnWindowScroll;
    this.isProductLink = isProductLink;

    this.render();
  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;
    this.searchParams._sort = id;
    this.searchParams._order = order;


    if (bottom < document.documentElement.clientHeight && !this.loading && !this.sortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;
      this.searchParams._start = this.start;
      this.searchParams._end = this.end;

      this.loading = true;

      const data = await this.loadData();
      this.update(data);

      this.loading = false;
    }
  };

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

      this.searchParams._sort = id;
      this.searchParams._order = this.sorted.order;
      this.start = 0;
      this.end = 30;
      this.searchParams._start = this.start;
      this.searchParams._end = this.end;

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer();
      }
    }
  };

  async render() {
    const { id, order } = this.sorted;
    this.searchParams._sort = id;
    this.searchParams._order = order;

    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData();

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData() {
    Object.keys(this.searchParams).map(key => {
      this.url.searchParams.set(key, this.searchParams[key]);
    });
    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url.toString());

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
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
    return this.isProductLink ?
      data.map(item => `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item, data)}
        </a>`
      ).join('')
      : data.map(item => `
        <div class="sortable-table__row">
          ${this.getTableRow(item, data)}
        </div>`
      ).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({ id, template }) => {
      return {
        id,
        template
      };
    });

    return cells.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>`;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);

    if (this.isOnWindowScroll) {
      document.addEventListener('scroll', this.onWindowScroll);
    }
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer() {
    const data = await this.loadData();

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

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
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
