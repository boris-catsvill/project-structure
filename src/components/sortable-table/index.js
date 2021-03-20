import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;

  onSortClick = event => {
    const column = event.target.closest('[data-sortable]');
    if (column) {
      const { id, order } = column.dataset;
      const next = {
        asc: 'desc',
        desc: 'asc',
        '': 'desc',
      };
      this.sort(id, next[order]);
    }
  };

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      const { id, order } = this.sorted;
      this.start = this.end;
      this.end = this.start + this.step;
      this.loading = true;
      const data = await this.loadData(id, order, this.start, this.end);
      this.addRows(data);
      this.loading = false;
    }
  };

  constructor(headerConfig = [], {
    url = '',
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc',
    },
    isSortLocally = false,
    step = 20,
    start = 0,
    end = start + step,
    placeholder = 'Не найдено',
    rowUrlTemplate = null,
  } = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;
    this.placeholder = placeholder;
    this.rowUrlTemplate = rowUrlTemplate;

    this.render();
  }

  async setFilter(filter = {}) {
    for (const key of this.url.searchParams.keys()) {
      this.url.searchParams.delete(key);
    }
    Object.entries(filter).forEach(([key, value]) => {
      this.url.searchParams.set(key, value);
    });
    const { id, order } = this.sorted;
    this.start = 0;
    this.end = this.start + this.step;
    this.subElements.body.innerHTML = '';
    this.data = await this.loadData(id, order, this.start, this.end);
    this.renderRows(this.data);
  }

  get template() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getBody()}
        </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">${this.placeholder}</div>
      </div>
    `;
  }

  getHeader() {
    return this.headerConfig.map(item => `
      <div class="sortable-table__cell" data-id="${item.id}" ${item.sortable ? 'data-sortable' : ''} data-order="${item.id === this.sorted.id ? this.sorted.order : ''}">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `).join('');
  }

  getBody(data = []) {
    if (this.rowUrlTemplate) {
      return data.map(item => `
        <a href="${this.rowUrlTemplate(item)}" class="sortable-table__row">
          ${this.getRow(item)}
        </a>
      `).join('');
    } else {
      return data.map(item => `
        <div class="sortable-table__row">
          ${this.getRow(item)}
        </div>
      `).join('');
    }
  }

  getRow(row) {
    return this.headerConfig.map(item => item.template ? item.template(row[item.id]) : `
      <div class="sortable-table__cell">${row[item.id]}</div>
    `).join('');
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    
    this.subElements = this.getSubElements();

    const { id, order } = this.sorted;
    this.data = await this.loadData(id, order, this.start, this.end);
    this.renderRows(this.data);

    this.initEventListners();
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.getBody(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  initEventListners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  sort(id, order) {
    this.sorted = { id, order };
    this.subElements.header.querySelectorAll('[data-sortable]').forEach(item => {
      item.dataset.order = item.dataset.id === id ? order : '';
    });
    if (this.isSortLocally) {
      this.sortLocally(id, order);
    } else {
      this.sortOnServer(id, order, 1, 1 + this.step);
    }
  }

  sortLocally(id, order) {
    const sortedData = this.sortData(id, order);
    this.renderRows(sortedData);
  }

  async sortOnServer(id, order, start, end) {
    this.data = await this.loadData(id, order, start, end);
    this.renderRows(this.data);
  }

  sortData(id, order) {
    const direction = ({ asc: 1, desc: -1 })[order];
    if (!direction) return this.data;
    const column = this.headerConfig.find(item => item.id === id);
    const { sortType, customSorting } = column;

    return [...this.data].sort((a, b) => {
      switch (sortType) {
        case 'string':
          return direction * a[id].localeCompare(b[id], ['ru', 'en'], { caseFirst: 'upper' });
        case 'number':
          return direction * (a[id] - b[id]);
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  addRows(data) {
    this.data.push(...data);
    const rows = document.createElement('div');
    rows.innerHTML = this.getBody(data);
    this.subElements.body.append(...rows.childNodes);
  }

  update(data) {
    this.data = data;
    this.renderRows(this.data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('scroll', this.onWindowScroll);
    this.subElements = {};
  }
}
