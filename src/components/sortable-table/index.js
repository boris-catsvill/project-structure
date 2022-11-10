import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  start = 1;
  step = 20;
  end = this.start + this.step;

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find((item) => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step,
    range,
    rowTemplate = (html, item) => `
      <div class="sortable-table__row">
        ${html}
      </div>`
  } = {}) {
    this.headersConfig = headersConfig;
    this.url = url;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;
    this.range = range;
    this.rowTemplate = rowTemplate;

    this.render();
  }

  onWindowScroll = async() => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);

      this.update(data);

      this.loading = false;
    }
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
          </div>
        </div>
      </div>  
      `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll(`[data-element]`);

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map((header) => this.getHeaderRow(header)).join('')}
      </div>`;  
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div
        class="sortable-table__cell"
        data-id="${id}"
        data-sortable="${sortable}"
        data-order="${order}"
      >
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>`;
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
    return data.map(item => this.rowTemplate(this.getTableRow(item), item)
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
    })
    .join(''); 
  }

  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');
    
    wrapper.innerHTML = this.getTemplate();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData(id, order, start = this.start, end = this.end) {
    const url = new URL(this.url, BACKEND_URL);

    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(url.toString());

    this.element.classList.remove('sortable-table_loading');

    return data;
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

  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
  }
  
  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find((item) => item.id === id);

    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };

    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case "number":
        return direction * (a[id] - b[id]);
      case "string":
        return direction * a[id].localeCompare(b[id], ["ru", "en"]);
      default:
        return direction * (a[id] - b[id]);
      }
    });
  }

  onHeaderClick = async (event) => {
    const column = event.target.closest('[data-sortable="true"]');

    if (!column) {
      return;
    }

    this.start = 0;
    this.end = this.start + this.step;

    const order = column.dataset.order === 'asc' ? 'desc' : 'asc';
    column.dataset.order = order;

    const arrow = column.querySelector('.sortable-table__sort-arrow');

    if (!arrow) {
      column.append(this.subElements.arrow);
    }

    if (this.isSortLocally) {
      this.sortOnClient(column.dataset.id, order, this.start, this.end);
    } else {
      this.sortOnServer(column.dataset.id, order, this.start, this.end);
    }
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.renderRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);

    window.addEventListener('scroll', this.onWindowScroll);
  }
    
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
    
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};

    window.removeEventListener('scroll', this.onWindowScroll);
  }

}
