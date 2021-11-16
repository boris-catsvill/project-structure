import fetchJson from '@/utils/fetch-json.js';

export default class SortableTable {
  element;
  subElements;
  data = [];
  isLoading = false;

  onScroll = async () => {
    const { id, order } = this.sorted;
    const { bottom } = this.element.getBoundingClientRect();

    if (document.documentElement.clientHeight > bottom && !this.isLoading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      const data = await this.loadData(id, order, this.start, this.end);

      this.addRows(data);
    }
  }

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {asc: 'desc', desc: 'asc'};

      return orders[order];
    };

    if (!column) return;

    const id = column.dataset.id;
    const order = toggleOrder(column.dataset.order);
    const arrow = column.querySelector('.sortable-table__sort-arrow');

    column.dataset.order = order;

    if (!arrow) column.append(this.subElements.arrow);

    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  constructor(headerConfig = [], {
    url = '',
    isSortLocally = false,
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    step = 30,
    start = 0,
    end = start + step,
    getTemplateBodyRow = (item, cells) => `<div class="sortable-table__row">${cells}</div>`,
    emptyPlaceholderHtml = 'No products'
  } = {}) {
    this.url = new URL(url, process.env.BACKEND_URL);
    this.headerConfig = headerConfig;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.step = step;
    this.start = start;
    this.end = end;
    this.getTemplateBodyRow = getTemplateBodyRow;
    this.emptyPlaceholderHtml = emptyPlaceholderHtml;

    this.render();
  }

  async render() {
    const wrapper = document.createElement('div');
    const { id, order } = this.sorted;

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderTableBody(data);
    this.initEventListeners();
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.setLoading(true);

    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    const data = await fetchJson(this.url);

    this.setLoading(false);

    return data;
  }

  addRows(data) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTableBodyRows(data);

    this.data = [...this.data, ...data];
    this.subElements.body.append(...wrapper.children);
  }

  update(data) {
    this.data = data;
    this.setEmptyPlaceholder(!data.length);
    this.subElements.body.innerHTML = this.getTableBodyRows(data);
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

  get template() {
    return `
      <div class="sortable-table sortable-table_loading">
        ${this.getTableHeader()}
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">${this.emptyPlaceholderHtml}</div>
      </div>
    `;
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => this.getTableHeaderCell(item)).join('')}
      </div>
    `;
  }

  getTableHeaderCell({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getTableHeaderSortingArrow(id)}
      </div>
    `;
  }

  getTableHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBodyRows(data) {
    return data
      .map(item => {
        const cells = this.headerConfig
          .map(({id, template}) => {
            return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
          })
          .join('');

        return this.getTemplateBodyRow(item, cells);
      })
      .join('');
  }

  setLoading(value) {
    if (value) {
      this.isLoading = true;
      this.element.classList.add('sortable-table_loading');
    } else {
      this.isLoading = false;
      this.element.classList.remove('sortable-table_loading');
    }
  }

  setEmptyPlaceholder(value) {
    if (value) {
      this.element.classList.add('sortable-table_empty');
    } else {
      this.element.classList.remove('sortable-table_empty');
    }
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderTableBody(data);
  }

  sortData(id, order) {
    const data = [...this.data];
    const column = this.headerConfig.find(item => item.id === id);
    const { sortType } = column;
    const directions = {asc: 1, desc: -1};
    const direction = directions[order];

    return data.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], ['ru', 'en'], {caseFirst: 'upper'});
        case 'date':
          return direction * (new Date(a[id]) - new Date(b[id]));
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  renderTableBody(data) {
    if (data.length) {
      this.setEmptyPlaceholder(false);
      this.data = data;
      this.subElements.body.innerHTML = this.getTableBodyRows(data);
    } else {
      this.setEmptyPlaceholder(true);
    }
  }

  initEventListeners() {
    document.addEventListener('scroll', this.onScroll);
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  removeEventListeners() {
    document.removeEventListener('scroll', this.onScroll);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
    this.subElements = {};
  }
}
