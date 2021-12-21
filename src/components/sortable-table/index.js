import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;
  title_like;
  price_gte;
  price_lte;
  status;
  createdAt_gte;
  createdAt_lte;

  onWindowScroll = async() => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.sortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
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

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder, 0, this.step);
      }
    }
  };

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
    editUrl = ''
  } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;
    this.editUrl = editUrl;

    this.render();
  }

  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData(
    id = this.sorted.id, order = this.sorted.order,
    start = this.start, end = this.end,
    title_like = this.title_like, price_gte = this.price_gte,
    price_lte = this.price_lte, status = this.status,
    createdAt_gte = this.createdAt_gte, createdAt_lte = this.createdAt_lte) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    if (price_gte !== undefined && price_gte >= 0) {
      this.url.searchParams.set('price_gte', price_gte);
    } else {
      this.url.searchParams.delete('price_gte');
    }
    if (price_lte !== undefined && price_lte >= 0) {
      this.url.searchParams.set('price_lte', price_lte);
    } else {
      this.url.searchParams.delete('price_lte');
    }
    if (title_like !== undefined && title_like !== '') {
      this.url.searchParams.set('title_like', title_like);
    } else {
      this.url.searchParams.delete('title_like');
    }
    if (status !== undefined && status !== '') {
      this.url.searchParams.set('status', status);
    } else {
      this.url.searchParams.delete('status');
    }
    if (createdAt_gte && this.url.searchParams.has('createdAt_gte')) {
      this.createdAt_gte = createdAt_gte;
      this.url.searchParams.set('createdAt_gte', createdAt_gte);
    }
    if (createdAt_lte && this.url.searchParams.has('createdAt_lte')) {
      this.createdAt_lte = createdAt_lte;
      this.url.searchParams.set('createdAt_lte', createdAt_lte);
    }

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

  async filter(filter){
    const {title_like, priceSelect, status} = filter;
    this.title_like = title_like;
    this.price_gte = priceSelect.from;
    this.price_lte = priceSelect.to;
    this.status = status;
    const data = await this.loadData(this.sorted.id, this.sorted.order,
      0, this.step,
      title_like, priceSelect.from, priceSelect.to, status);

    this.addRows(data);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `<div class="sortable-table__cell"
      data-id="${id}"
      ${sortable ? `data-sortable="${sortable}"` : ''}
      ${sortable ? `data-order="${order}"` : ''}>
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
    return data.map(item => {
        return `<${this.editUrl !== '' ? 'a' : 'div'} class="sortable-table__row" ${this.editUrl !== '' ? 'href="/' + this.editUrl + '/' + item.id + '"' : ''}>
        ${this.getTableRow(item, data)}
      </${this.editUrl !== '' ? 'a' : 'div'}>`
    }).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({id, template}) => {
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
    document.addEventListener('scroll', this.onWindowScroll);
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
    const {sortType, customSorting} = column;
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
