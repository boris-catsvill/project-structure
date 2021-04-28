import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {
  constructor(headerConfig = [], {
    url = '',
    data = [],
    sorted = {},
    isSortLocally = false,
    loading = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {
    this.headerData = headerConfig;
    this.url = url;
    this.data = data;
    this.isSortLocally = isSortLocally;
    this.loading = loading;
    this.start = start;
    this.end = end;
    this.step = step;

    this.sorted = sorted.id !== undefined ? sorted : {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    };

    this.initComponent();
    this.initEventListeners();
  }

  getHeader(headerData = []) {
    const header = headerData.map(({ id = "", sortable = false, title = "" }) => {
      const sortingOrder = (id === this.sorted.id) ? this.sorted.order : '';

      const sortingArrow = `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      `;

      const column = `
        <div class="sortable-table__cell" data-id=${id} data-sortable=${sortable} data-order=${sortingOrder}>
          <span>${title}</span>
          ${sortingArrow}
        </div>
      `;

      return column;
    });

    return header.join('');
  }

  getBody(data) {
    const rows = data.map((element) => {
      const cells = this.headerData.map(column => {
        const cell = column.template === undefined ?
          `<div class="sortable-table__cell">${element[column.id]}</div>`
          :
          column.template(element[column.id]);

        return cell;
      });

      const row = `
        <a href="/products/${element.id}" class="sortable-table__row">
          ${cells.join('')}
        </a>
      `;

      return row;
    });

    return rows.join('');
  }

  getTable() {
    const header = this.getHeader(this.headerData);
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${header}
        </div>
        <div data-element="body" class="sortable-table__body">
        </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
        </div>
      </div>
    `;
  }

  addRows(data) {
    this.data = data;

    this.update(data);
  }

  initComponent() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    this.render(this.sorted.id, this.sorted.order);
  }

  async loadData(fieldValue = this.sorted.id, orderValue = this.sorted.order, start = this.start, end = this.end) {
    const url = new URL(`${BACKEND_URL}${this.url}/`);

    url.searchParams.set('_sort', fieldValue);
    url.searchParams.set('_order', orderValue);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(url.toString());

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  async render(fieldValue, orderValue, start, end) {
    const data = await this.loadData(fieldValue, orderValue, start, end);

    this.addRows([...this.data, ...data]);
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getBody(data);

    if(this.subElements.body){
      this.subElements.body.append(...rows.childNodes);
    }
  }

  async sortOnServer(fieldValue, orderValue, start, end) {
    this.render(fieldValue, orderValue, start, end);
  }

  sortOnClient(fieldValue, orderValue) {
    const sortedData = this.sortData(fieldValue, orderValue);

    this.updateTable(sortedData);
  }

  initEventListeners() {
    const headerSortableColumn = this.element.querySelectorAll('[data-sortable="true"]');

    const onSortClick = (event) => {
      this.sorted.id = event.currentTarget.getAttribute('data-id');
      this.sorted.order = event.currentTarget.getAttribute('data-order') === 'asc' ||
        event.currentTarget.getAttribute('data-order') === '' ? 'desc' : 'asc';
      const { id, order } = this.sorted;

      if (this.isSortLocally) {
        this.sortOnClient(id, order);
      } else {
        this.sortOnServer(id, order, 1, 1 + this.step);
      }
    };

    const onWindowScroll = async () => {
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

    headerSortableColumn.forEach((element) => {
      element.addEventListener('pointerdown', onSortClick);
    });

    document.addEventListener('scroll', onWindowScroll);
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headerData.find(item => item.id === id);
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
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove(){
    this.element.remove();
    document.removeEventListener('scroll', this.onWindowScroll);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
