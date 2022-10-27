import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  url;
  loading = false;
  step = 29;
  start = 1;
  end = this.start + this.step;
  constructor(
    headersConfig = [],

    {
      url = '',
      sorted = {
        id: headersConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      product = true,
      isSortLocally = false,
      step = 29,
      start = 1,
      end = start + step
    } = {}
  ) {
    this.product = product;
    this.headersConfig = headersConfig;
    this.url = url;
    this.id = sorted.id;
    this.order = sorted.order;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.fetchData(id, order, start, end);

    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.data = data;
      this.subElements.body.innerHTML = this.getBody(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  async fetchData(id = this.id, order = this.order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  sortOnClient(id, order) {
    const sortedData = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);

    const { sortType, customSorting } = column;
    const direction = order === 'asc' ? 1 : -1;

    sortedData.sort((a, b) => {
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
    this.subElements.body.innerHTML = this.getBody(sortedData);
  }

  onClickSort = e => {
    const target = e.target.closest('[data-sortable = "true"]');

    if (target) {
      const orderUpdate = this.order === 'asc' ? 'desc' : 'asc';
      this.order = orderUpdate;
      target.dataset.order = orderUpdate;
      target.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(target.dataset.id, this.order);
      } else {
        this.sortOnServer(target.dataset.id, this.order);
      }
    }
  };

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onClickSort);
    document.addEventListener('scroll', this.dynamicScroll);
  }

  dynamicScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.loading = true;
      this.start = this.end;
      this.end = this.start + this.step;
      const fetch = await this.fetchData(this.id, this.order, this.start, this.end);
      if (this.data.length === [...this.data, ...fetch].length) return;
      this.data = [...this.data, ...fetch];

      this.loading = false;

      this.update(this.data);
    }
  };

  getTemplate() {
    return `
      <div class="sortable-table">
        ${this.getHeader()}
        <div data-element="body" class="sortable-table__body">
          ${this.getBody(this.data)}
        </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>Нет данных</div>
        </div>
      </div>`;
  }

  getBody(data) {
    if (data) {
      return this.product
        ? data
            .map(
              item =>
                ` <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getBodyItem(item)}
          </a>`
            )
            .join('')
        : data
            .map(item => `<div class="sortable-table__row">${this.getBodyItem(item)}</div>`)
            .join('');
    }
    return '';
  }

  getBodyItem(item) {
    return this.headersConfig
      .map(data => {
        return data.template
          ? data.template(item[data.id])
          : `<div class="sortable-table__cell">${item[data.id]}</div>`;
      })
      .join('');
  }

  getHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderItem(item)).join('')}
    </div>`;
  }

  getHeaderItem({ id, title, sortable }) {
    const order = this.id === id ? this.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${
          this.id === id
            ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
          </span>`
            : ''
        }
      </div>
    `;
  }

  async render() {
    if (this.element) this.remove();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    const data = await this.fetchData(this.id, this.order, this.start, this.end);
    this.data = data;
    this.initEventListeners();
    this.update(this.data);
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }
    return subElements;
  }

  update(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getBody(data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.url = null;
    this.subElements = {};
    this.element = null;
    document.removeEventListener('scroll', this.dynamicScroll);
  }
}
