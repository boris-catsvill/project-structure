import fetchJson from '../../utils/fetch-json.js';
import getSubElements from '../../utils/getSubElements';

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
  anyStatus = 3;

  constructor(
    headerConfig = [],
    {
      url = '',
      isSortLocally = false,
      isLinkToProductExist = false,
    },
    sorted = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, process.env.BACKEND_URL);
    const { id, order } = sorted;
    this.latestOrder = order;
    this.latestId = id;
    this.isSortLocally = isSortLocally;
    this.isLinkToProductExist = isLinkToProductExist;

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
      if (this.isLinkToProductExist) {
        return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getBodyRow(item)}
        </a>
      `;
      }
      return `
        <div class="sortable-table__row">
          ${this.getBodyRow(item)}
        </div>
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

  changeOrder(order) {
    const orders = {
      asc: 'desc',
      desc: 'asc'
    };

    return orders[order];
  }

  sortListener = (event) => {
    const column = event.target.closest('[data-sortable="true"]');
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
    if (this.subElements.body) {
      this.subElements.body.innerHTML = this.getBodyRows(data);
    }
  }

  downloadListener = async () => {
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    if (document.documentElement.scrollTop + document.documentElement.clientHeight + 200 > scrollHeight && !this.loading) {
      this.loading = true;
      const data = await this.loadData(this.latestId, this.latestOrder, this.offset, this.offset + this.limit, this.costFrom, this.costTo, this.searchString);
      this.offset += this.limit;
      this.data = [...this.data, ...data];
      this.updateTable(this.data);
      this.loading = false;
    }
  }

  searchListener = async (event) => {
    const { detail: { price_gte, price_lte, title_like, status } } = event;
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
    if (status === this.anyStatus) this.url.searchParams.delete('status');
    if (status && status !== this.anyStatus) this.url.searchParams.set('status', status);

    if (this.element) {
      this.element.classList.add('sortable-table_loading');
    }

    const data = await fetchJson(this.url);

    if (this.element) {
      this.element.classList.remove('sortable-table_loading');
    }
    this.loading = false;
    return data;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = getSubElements(element, 'element');

    this.subElements.header.addEventListener('pointerdown', this.sortListener);

    this.data = await this.loadData(this.latestId, this.latestOrder, this.start, this.start + this.limit, this.costFrom, this.costTo, this.searchString, this.status);

    this.updateTable(this.data);
    this.offset += this.limit;

    if (!this.isSortLocally) {
      document.addEventListener('scroll', this.downloadListener);
    }

    document.addEventListener('date-search', this.searchListener);
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
    if (this.subElements.header) {
      this.subElements.header.removeEventListener('pointerdown', this.sortListener);
    }
    this.remove();
    this.element = null;
    this.subElements = {};
    document.removeEventListener('scroll', this.downloadListener);
  }
}
