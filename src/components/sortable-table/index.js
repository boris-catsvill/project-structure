import fetchJson from '../../utils/fetch-json';

export default class SortableTable {
  static LIMIT = 30;
  element;
  subElements;
  #loading;

  constructor(
    headerConfig = [],
    {
      data = [],
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      isSortLocally = false,
      url = ''
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.#loading = false;
    this.render();
  }

  get isLoading() {
    return this.#loading;
  }

  set isLoading(loading) {
    if (loading) {
      this.element.classList.remove('sortable-table_empty');
      this.element.classList.add('sortable-table_loading');
    } else {
      this.element.classList.remove('sortable-table_loading');
    }
    this.#loading = loading;
  }

  get isEmpty() {
    return !this.data.length;
  }

  set isEmpty(empty) {
    if (empty) {
      this.element.classList.add('sortable-table_empty');
    } else {
      this.element.classList.remove('sortable-table_empty');
    }
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
      const newOrder = toggleOrder(order); // undefined
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  getTableHeaderRow() {
    return `<div data-element='header' class='sortable-table__header sortable-table__row'>
                ${this.headerConfig.map(item => this.getHeaderCell(item)).join('')}
            </div>`;
  }

  getHeaderCell({ id, title, sortable }) {
    const dataId = `data-id='${id}'`;
    const dataSortable = sortable ? 'data-sortable=true' : '';
    const dataOrder = sortable ? `data-order='${this.sorted.order}'` : '';

    return `<div class='sortable-table__cell' ${dataId} ${dataSortable} ${dataOrder}>
              <span>${title}</span>
              ${this.getHeaderSortingArrow(id)}
            </div>`;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element='arrow' class='sortable-table__sort-arrow'>
          <span class='sort-arrow'></span>
        </span>`
      : '';
  }

  getTableBody(data = []) {
    return `
      <div data-element='body' class='sortable-table__body'>
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data
      .map(item => `<div class='sortable-table__row'>${this.getTableRow(item)}</div>`)
      .join('');
  }

  getTableRow(item) {
    return this.headerConfig
      .map(
        ({ id, template }) =>
          `<div class='sortable-table__cell'>${template ? template(item[id]) : item[id]}</div>`
      )
      .join('');
  }

  setUrlRange({ from, to }) {
    this.sorted.start = 0;
    this.sorted.end = this.offset;
    this.url.searchParams.set('_start', this.sorted.start);
    this.url.searchParams.set('_end', this.sorted.end);
    this.url.searchParams.set('createdAt_gte', from.toISOString());
    this.url.searchParams.set('createdAt_lte', to.toString());
  }

  getLoading() {
    return `<div data-element='loading' class='loading-line sortable-table__loading-line'></div>`;
  }

  getEmptyPlaceholder() {
    return `<div data-element='emptyPlaceholder' class='sortable-table__empty-placeholder'><div>No data</div></div>`;
  }

  setEmptyPlaceholder(html = '<div>No data</div>') {
    this.subElements.emptyPlaceholder.innerHTML = '';
    this.subElements.emptyPlaceholder.append(html);
  }

  getTable(data = []) {
    return `
      <div class='sortable-table sortable-table_loading'>
        ${this.getTableHeaderRow()}
        ${this.getTableBody(data)}
        ${this.getLoading()}
        ${this.getEmptyPlaceholder()}
     </div>`;
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable(this.data);

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
    if (this.isEmpty) {
      this.isLoading = true;
      const loadedData = await this.loadData(this.sorted);
      this.isLoading = false;
      this.#addRows(loadedData);
    }
    this.isLoading = false;
  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.isLoading && !this.isSortLocally) {
      this.sorted.start = this.sorted.end;
      this.sorted.end = this.sorted.start + this.offset;
      this.isLoading = true;

      const data = await this.loadData(this.sorted);

      this.#addRows(data);

      this.isLoading = false;
    }
  };

  update(data) {
    const { body } = this.subElements;
    this.data = data;
    this.isEmpty = !this.data.length;
    body.innerHTML = this.getTableRows(data);
    this.isLoading = false;
  }

  async sortOnServer(id, order) {
    this.sorted = { id, order };

    this.isLoading = true;
    const sortedData = await this.loadData(this.sorted);
    this.isLoading = false;
    this.update(sortedData);
  }

  #addRows(data) {
    const { body } = this.subElements;
    body.insertAdjacentHTML('beforeend', this.getTableRows(data));
    this.data = [...this.data, ...data];
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    window.addEventListener('scroll', this.onWindowScroll);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);
    this.#addRows(sortedData);
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === id);
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
          throw new Error(`Unknown sort type ${sortType}`);
      }
    });
  }

  async loadData({ id, order, start = 0, end = this.offset } = {}) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    return await fetchJson(this.url);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
