import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  subElements = {};
  headers = {};
  dataBatchSize = 30;
  scrollOffset = 50;

  constructor(headersConfig = [],  
              {url = '',
              isSortLocally = false,
              isRowsClickable = false,
              urlSettings = {},
              sorted = { id: headersConfig.find(header => header.sortable).id,
                         order: 'asc'}} = {})
  {
    this.headerConfig = headersConfig;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.urlSettings = urlSettings;
    this.isSortLocally = isSortLocally;
    this.isRowsClickable = isRowsClickable;
    this.sorted = sorted;
    this.start = 0;
    this.end = this.dataBatchSize;
    this.data = [];
    this.dataEnd = false;

    this.render();
  }

  onScroll = async () => {
    const {bottom} = this.element.getBoundingClientRect();

    if (bottom < document.documentElement.clientHeight + this.scrollOffset && !this.loading && !this.dataEnd && !this.isSortLocally) {
      this.start += this.dataBatchSize;
      this.end += this.dataBatchSize;

      this.loading = true;

      const dataBatch = await this.loadData();
      this.updateTableBodyElements(dataBatch);

      if(dataBatch.length < this.dataBatchSize) this.dataEnd = true;
      this.loading = false;
    }
  }

  onHeaderClick = (event) => {
    const sortColumn = event.target.closest('[data-sortable="true"]');
    if(!sortColumn) return;

    const sortKey = sortColumn.dataset.id;
    const order = (sortColumn.dataset.order === 'asc') ? 'desc' : 'asc'

    this.clearData();

    this.editHeaderArrow(sortKey, order);

    this.sorted.id = sortKey;
    this.sorted.order = order;

    this.sort(sortKey, order);
  }

  onResetFiltersButtonClick = () => {
    this.element.dispatchEvent(new CustomEvent('reset-filters', {
      bubbles: true
    }));
  }

  getTemplate(data) {
    return `
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.renderHeaderElements()}
      </div>
      <div data-element="body" class="sortable-table__body">
      ${this.renderTableBodyElements(data)}
      </div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button data-element="resetFiltersButton" type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    </div>`;
  }

  getSubElements(key) {
    const result = {};
    const elements = this.element.querySelectorAll(`[data-${key}]`);

    for (const subElement of elements) {
      const name = subElement.dataset[key];
      result[name] = subElement;
    }

    return result;
  }

  renderTableBodyElements(data) {
    return data.map(item => this.isRowsClickable ? this.renderClickableRow(item) : this.renderRegularRow(item)).join('');
  }

  renderClickableRow(item) {
    return `<a href="/products/${item.id}" class="sortable-table__row">
              ${this.renderRowElements(item).join('')}
            </a>`;
  }

  renderRegularRow(item) {
    return `<div class="sortable-table__row">
              ${this.renderRowElements(item).join('')}
            </div>`;
  }

  renderRowElements(item) {
    return this.headerConfig.map(header => {
      return (header.template) ?
        header.template(item[header.id]) :
        `<div class="sortable-table__cell">${item[header.id]}</div>`; 
      }
    ); 
  }

  renderHeaderElements() {
    return this.headerConfig.map(header =>{
      const order = (this.sorted.id === header.id) ? this.sorted.order : 'asc';
      return `
        <div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" data-order="${order}">
          <span>${header.title}</span>
          ${(this.sorted.id === header.id) ? this.getHeaderSortingArrow() : ''}
        </div>
      `}).join('');    
  }

  getHeaderSortingArrow () {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>`;
  }

  sort(sortKey = '', order= 'asc') {
    if (this.isSortLocally) {
      this.sortOnClient(sortKey, order);
    } else {
      this.sortOnServer();
    }
  }

  async sortOnServer() {
    const dataBatch = await this.loadData();
    this.updateTableBodyElements(dataBatch);
  }

  sortOnClient(sortKey, order) {
    const sortedData = this.sortData(sortKey, order);
    this.subElements.body.innerHTML = this.renderTableBodyElements(sortedData);
  }

  sortData(sortKey, order) {
    const column = this.headerConfig.find(header => header.id === sortKey);
    const orderAsNum = (order === 'desc') ? -1 : 1;

    return [...this.data].sort((a,b) => {
      switch(column.sortType) {
        case 'number' : return orderAsNum * (a[sortKey] - b[sortKey]);
        case 'string' : return orderAsNum * a[sortKey].localeCompare(b[sortKey], ['ru', 'en'], {caseFirst: 'upper'});
        default : return orderAsNum * (a[sortKey] - b[sortKey]);;
        }
      }
    );
  }

  editHeaderArrow(newSortKey, newOrder) {
    this.headers[newSortKey].dataset.order = newOrder;
    if(newSortKey !== this.sorted.id) {
      this.headers[newSortKey].append(this.headers[this.sorted.id].lastElementChild);  
    }
  }

  getURL() {
    const url = new URL(this.url);
    Object.entries(this.urlSettings).map(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('_sort',  this.sorted.id);
    url.searchParams.set('_order', this.sorted.order);
    url.searchParams.set('_start', this.start);
    url.searchParams.set('_end', this.end);
    return url;
  }

  resetUrlSettings() {
    this.urlSettings = {};
  }

  async loadData() {
    const url = this.getURL();

    this.element.classList.add('sortable-table_loading');

    try {
      const data = await fetchJson(url);
      return data;
    } catch (error) {
      throw new Error(`Unable to fetch data from ${url}`);
    }
    finally {
      this.element.classList.remove('sortable-table_loading');
    }
  }

  updateTableBodyElements(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.data.push(...data);
      this.subElements.body.insertAdjacentHTML('beforeend', this.renderTableBodyElements(data));
    } else {
      if(!this.subElements.body.childElementCount) this.element.classList.add('sortable-table_empty');
    }
  }
  
  async update(urlSettings = {}) {
    this.clearData();  

    Object.entries(urlSettings).map(([key, value]) => this.urlSettings[key] = value);
    const data = await this.loadData();
  
    this.updateTableBodyElements(data);
  }
  
  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate(this.data);
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements("element");
    this.headers =  this.getSubElements("id");

    this.editHeaderArrow(this.sorted.id, this.sorted.order);
    this.initEventListeners();

    const dataBatch = await this.loadData();
    this.updateTableBodyElements(dataBatch);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    this.subElements.resetFiltersButton.addEventListener('pointerdown', this.onResetFiltersButtonClick);
    window.addEventListener('scroll', this.onScroll);
  }

  clearData() {
    this.start = 0;
    this.end = this.dataBatchSize;
    this.dataEnd = false;
    if(!this.isSortLocally) this.data = [];
    this.subElements.body.innerHTML = '';  
  }
    
  remove() {
    if(this.element) this.element.remove();
  }
    
  destroy() {
    window.removeEventListener('scroll', this.onScroll);

    this.remove();
    this.element = null;
    this.subElements = {};
    this.headers = {}; 
  }
}