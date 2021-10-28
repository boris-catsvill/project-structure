import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {
  element = null;
  subElements = {};
  data = [];
  loadStart = 0;
  loadLength = 30;
  isLoading = false;

  pointerdownHandler = event => {
    const target = event.target.closest('[data-sortable = "true"]');

    if (!target) return;

    event.preventDefault();

    this.sorted.id = target.dataset.id;
    this.sorted.order = (target.dataset.order === 'desc') ? 'asc' : 'desc';

    Array.from(this.subElements.header.children).map(cell => cell.dataset.order = '');
    target.dataset.order = this.sorted.order;

    if (this.isSortLocally) {
      this.sortOnClient(this.sorted.id, this.sorted.order);
    } else {
      this.sortOnServer(this.sorted.id, this.sorted.order);
    }
  }

  scrollHandler = async event => {
    if (this.isSortLocally) return;

    let scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );

    const firePointer = scrollHeight - document.documentElement.clientHeight;

    if (window.pageYOffset === firePointer && !this.isLoading) {
      this.loadStart = this.loadStart + this.loadLength;

      this.isLoading = true;

      const loadedData = await this.loadData();

      if (loadedData.length === 0 || loadedData.length < this.loadLength) {
        document.removeEventListener('scroll', this.scrollHandler);
      }

      this.updateTableData([...this.data, ...loadedData]);

      this.isLoading = false;
    }
  }

  constructor(headersConfig = [], {
    url = '',
    isSortLocally = false,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    emptyPlaceholder = '<div><p>No data</p></div>',
    isRowALink = true
  } = {}) {
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.headerConfig = headersConfig;
    this.sorted = sorted;
    this.emptyPlaceholder = emptyPlaceholder;
    this.isRowALink = isRowALink;

    this.render();
  }

  async render() {
    const element = document.createElement('div');
    const {id, order} = this.sorted;

    element.innerHTML = this.getTable();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const data = await this.loadData(id, order);

    this.subElements.header.innerHTML = this.getHeaderRow();

    this.subElements.emptyPlaceholder.innerHTML = this.emptyPlaceholder;

    this.updateTableData(data);
    this.initEventListeners();
  }

  getTable() {
    return `
      <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row"></div>
          <div data-element="body" class="sortable-table__body"></div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder"></div>
      </div>
    `;
  }

  getHeaderRow() {
    return this.headerConfig.map(({id, sortable, title}) => {
      const order = (id === this.sorted.id) ? this.sorted.order : '';

      return `
        <div class="sortable-table__cell"
            data-id="${id}"
            data-sortable="${sortable}"
            data-order="${order}"
            <span>${title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
        </div>
      `;
    }).join('');
  }

  getBodyRows(data) {
    return data.map(rowData => {
      return this.isRowALink ?
        `<a href="/products/${rowData.id}" class="sortable-table__row">${this.getBodyRow(rowData)}</a>` :
        `<div class="sortable-table__row">${this.getBodyRow(rowData)}</div>`;
    }).join('');
  }

  getBodyRow(rowData) {
    return Array.from(this.headerConfig).map(({id, template}) => {
      if (template) {
        return template(rowData[id]);
      } else {
        return `<div class="sortable-table__cell">${rowData[id]}</div>`;
      }
    }).join('');
  }

  async update(url) {
    this.url = url;
    this.loadStart = 0;

    const loadedData = await this.loadData();

    if (loadedData.length) {
      document.addEventListener('scroll', this.scrollHandler);
    }
    this.updateTableData(loadedData);
  }

  updateTableData(data) {
    this.data = data;

    if (data.length) {
      this.element.classList.remove('sortable-table_empty');

      if (this.isSortLocally) {
        Array.from(this.subElements.header.children).map(cell => cell.dataset.order = '');
      }

      this.subElements.body.innerHTML = this.getBodyRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  sortOnClient(id, order) {
    const sortedData = this.sort(id, order);

    this.subElements.body.innerHTML = this.getBodyRows(sortedData);
  }

  async sortOnServer(id, order) {
    this.loadStart = 0;

    const loadedData = await this.loadData(id, order);

    if (loadedData.length) {
      document.addEventListener('scroll', this.scrollHandler);
    }
    this.updateTableData(loadedData);
  }

  sort(id, order) {
    const column = this.headerConfig.find(item => item.id === id);
    const {sortType, customSorting} = column;

    return Array.from(this.data).sort((productA, productB) => {
      const a = productA[id];
      const b = productB[id];
      let result = null;

      switch (sortType) {
        case 'number':
          result = a - b;
          break;
        case 'string':
          result = a.localeCompare(b, ['ru-u-kf-upper', 'en-u-kf-upper']);
          break;
        case 'date':
          result = new Date(a) - new Date(b);
          break;
        case 'custom':
          result = customSorting(a, b);
          break;
        default:
          result = a - b;
      }

      if (order === 'asc') {
        return result;
      } else if (order === 'desc') {
        return -result;
      }
    });
  }

  getSubElements(parentElement) {
    const elements = parentElement.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async loadData(sortId = this.sorted.id,
                 sortOrder = this.sorted.order,
                 start = this.loadStart,
                 length = this.loadLength) {
    if (!this.url) return;

    this.setLoadingInd();

    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('_sort', sortId);
    url.searchParams.set('_order', sortOrder);
    url.searchParams.set('_start', start.toString());
    url.searchParams.set('_end', (start + length).toString());

    let loadedData = [];

    loadedData = await fetchJson(url.href);

    this.removeLoadingInd();

    return loadedData;
  }

  setLoadingInd() {
    this.subElements.loading.style.display = 'block';
  }

  removeLoadingInd() {
    this.subElements.loading.style.display = 'none';
  }

  initEventListeners () {
    this.subElements.header.addEventListener('pointerdown', this.pointerdownHandler);
    document.addEventListener('scroll', this.scrollHandler);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    document.removeEventListener('scroll', this.scrollHandler);
  }
}
