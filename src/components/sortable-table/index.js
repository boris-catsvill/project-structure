import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  start = 0;
  limit = 30;
  offset = 0;
  costTo;
  costFrom;
  searchString;
  status;

  constructor(
    headerConfig = [],
    {
      url = '',
      isSortLocally = false,
    },
    sorted = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, BACKEND_URL);
    const { id, order } = sorted;
    this.latestOrder = order;
    this.latestId = id;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  getHeaderCells(data) {
    return data.map((config) => {
      return `
        <div class="sortable-table__cell" data-id=${config.id} data-sortable=${config.sortable}>
            <span>${config.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
        </div>
      `;
    }).join('');
  }

  getHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderCells(this.headerConfig)}
      </div>
    `;
  }

  getBodyRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template,
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `
          <div class="sortable-table__cell">
            ${item[id]}
          </div>
          `;
    }).join('');
  }

  getBodyRows(data) {
    return data.map((item) => {
      return `
        <a href="${BACKEND_URL}/products/${item.id}" class="sortable-table__row">
          ${this.getBodyRow(item)}
        </a>
      `;
    }).join('');
  }

  getBody() {
    return `
      <div data-element="body" class="sortable-table__body">
      ${this.getBodyRows(this.data)}
      </div>
    `;
  }

  getTemplate() {
    return `
        <div class="sortable-table">
            ${this.getHeader()}
            ${this.getBody()}
        </div>
    `;
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find((item) => item.id === id);
    const { sortType } = column;
    const directions = {
      'asc': 1,
      'desc': -1,
    };

    const direction = directions[order];

    arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], ['ru', 'en']);
        default:
          return direction * (a[id] - b[id]);
      }
    });
    return arr;
  }

  getSubElements(element) {
    const elements = {};

    const subElements = element.querySelectorAll('[data-element]');

    for (const subElement of subElements) {
      elements[subElement.dataset.element] = subElement;
    }

    return elements;
  }

  changeOrder(order) {
    let newOrder;
    if (order === 'asc') newOrder = 'desc';
    if (order === 'desc') newOrder = 'asc';
    return newOrder;
  }

  sortListener = (e) => {
    const column = e.target.closest('[data-sortable="true"]');
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');

    if (column) {
      const { id, order } = column.dataset;
      this.latestOrder = this.changeOrder(order || 'asc');
      this.latestId = id;
      allColumns.forEach((column) => {
        column.dataset.order = '';
      });
      column.dataset.order = this.latestOrder;

      if (this.isSortLocally) {
        this.sortOnClient(this.latestId, this.latestOrder);
      } else {
        this.sortOnServer(this.latestId, this.latestOrder);
      }
    }
  };

  updateTable(data) {
    this.subElements.body.innerHTML = this.getBodyRows(data);
  }

  downloadListener = async () => {
    if (this.subElements.body.getBoundingClientRect().bottom < document.documentElement.clientHeight + 200 && !this.loading) {
      this.loading = true;
      const data = await this.loadData(this.latestId, this.latestOrder, this.offset, this.offset + this.limit, this.costFrom, this.costTo, this.searchString);
      this.offset += this.limit;
      this.data = [...this.data, ...data];
      this.updateTable(this.data);
      this.loading = false;
    }
  }

  searchListener = async (e) => {
    const { detail: { price_gte, price_lte, title_like, status } } = e;
    this.costFrom = price_gte;
    this.costTo = price_lte;
    this.searchString = title_like;
    this.status = status;
    const data = await this.loadData(this.latestId, this.latestOrder, this.start, this.start + this.limit, this.costFrom, this.costTo, this.searchString, this.status);
    this.updateTable(data);
  };

  async loadData(id, order, start, end, priceFrom, priceTo, searchString, status) {
    this.url.searchParams.set('_start', start.toString());
    this.url.searchParams.set('_end', end.toString());

    if (id) this.url.searchParams.set('_sort', id);
    if (order) this.url.searchParams.set('_order', order);
    if (priceFrom !== undefined && !Number.isNaN(priceFrom)) this.url.searchParams.set('price_gte', priceFrom);
    if (priceTo !== undefined && !Number.isNaN(priceTo)) this.url.searchParams.set('price_lte', priceTo);
    if (searchString) this.url.searchParams.set('title_like', searchString);
    if (status === 3) this.url.searchParams.delete('status');
    if (status && status !== 3) this.url.searchParams.set('status', status);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');
    this.loading = false;
    return data;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.subElements.header.addEventListener('pointerdown', this.sortListener);

    this.loadData(this.latestId, this.latestOrder, this.start, this.start + this.limit, this.costFrom, this.costTo, this.searchString, this.status)
      .then((data) => {
        this.data = data;
        this.updateTable(data);
        this.offset += this.limit;
        if (!this.isSortLocally) document.addEventListener('scroll', this.downloadListener);
      });

    document.addEventListener('date-search', (e) => this.searchListener(e));
  }

  sortOnClient (id, order) {
    const sortedData = this.sortData(id, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);

    allColumns.forEach((column) => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;

    this.updateTable(sortedData);
  }

  async sortOnServer (id, order) {
    this.data = await this.loadData(id, order, this.start, this.offset, this.costFrom, this.costTo, this.searchString, this.status);
    this.updateTable(this.data);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('scroll', this.downloadListener);
    if (this.subElements.header) {
      this.subElements.header.removeEventListener('pointerdown', this.sortListener);
    }
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
