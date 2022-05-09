import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  onArrowLink = null
  isLoading = false
  start = 0
  handleScrollEvent = async (event) =>{
    if (this.isLoading) return;

    const relativeBottom = document.documentElement.getBoundingClientRect().bottom;
    if (relativeBottom < Number(document.documentElement.clientHeight) + 100) {
      this.isLoading = true;
      this.start += this.chunk;
      this.end += this.chunk;
      const responseData = await this.fetchData();
      this._addData(responseData);
      this.isLoading = false;
    }

  }

  constructor(headerConfig, {
    data = [],
    sorted = {id: 'title', order: 'asc' },
    isSortLocally = false,
    url,
    immediateFetch = true,
    chunk = CHUNK_VALUE,
  } = {}) {
    this.headerConfig = headerConfig;
    this.end = chunk;
    this.chunk = chunk;
    this.parseConfig();
    this.isSortLocally = isSortLocally;
    this.defaultSort = sorted;
    this.defaultSort.options = sorted.options || {};
    this.render();
    this.initEventListeners();

    if (url) {
      this.url = BACKEND_URL + '/' + url;
      if (immediateFetch) {
        this.isLoading = true;
        this.fetchData().then(data => this._replaceData(data));
      }
    } else {
      this.elementBodyLink.parentElement.classList.add('sortable-table_loading');
      this.data = data;
      this.elementBodyLink.innerHTML = this.getTemplateTableBody(this.data);
      this.elementBodyLink.parentElement.classList.remove('sortable-table_loading');
    }

  }

  render () {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.elementBodyLink = element.querySelector('.sortable-table__body');
    this.element = element.firstElementChild;
  }

  initEventListeners () {
    if (document.readyState !== 'complete') {
      document.addEventListener('DOMContentLoaded', this._initEvents.bind(this));
    } else {
      this._initEvents();
    }

  }

  _initEvents () {
    if (!this.onArrowLink) {
      this.onArrowLink = document.querySelector(`[data-id=${this.defaultSort.id}] .sortable-table__sort-arrow`);
      if (this.onArrowLink) {
        this.onArrowLink.style.opacity = 1;
      } else {
        this.onArrowLink = this.element.querySelector('.sortable-table__sort-arrow');
      }

    }

    this.element.querySelector('.sortable-table__header').addEventListener('pointerdown', this.handleSortEvent.bind(this));

    if (!this.isSortLocally) {
      window.addEventListener('scroll', this.handleScrollEvent);
    }

  }



  handleSortEvent (event) {
    const sorTablCell = event.target.closest('.sortable-table__cell');
    if (!sorTablCell) return;
    if (sorTablCell.dataset.sortable === 'false') return;

    this.sort(sorTablCell.dataset.id, sorTablCell.dataset.order);
    if (sorTablCell.dataset.order === 'asc') {
      sorTablCell.dataset.order = 'desc';
    } else if (sorTablCell.dataset.order === 'desc') {
      sorTablCell.dataset.order = 'asc';
    }

    const newArrowLink = sorTablCell.querySelector('.sortable-table__sort-arrow');
    if (newArrowLink !== this.onArrowLink) {newArrowLink.style.opacity = 1;
      this.onArrowLink.style.opacity = 0;
      this.onArrowLink = newArrowLink;
    }







  }

  sort (fieldValue = this.defaultSort.id, orderValue = this.defaultSort.order, isSortLocally = this.isSortLocally) {

    if (isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      this.sortOnServer(fieldValue, orderValue);
      this.defaultSort.id = fieldValue;
      this.defaultSort.order = orderValue;
    }

  }

  sortOnClient (fieldValue, orderValue) {
    const directions = {
      asc: 1,
      desc: -1
    };

    const direction = directions[orderValue];
    this.elementBodyLink.innerHTML = this.getTemplateTableBody([...this.data].sort((a, b) =>{
      return direction * this.sortByType(this.getSortType(fieldValue), a[fieldValue], b[fieldValue]);
    }));
  }

  sortOnServer (fieldValue, orderValue) {
    this.start = 0;
    this.end = CHUNK_VALUE;
    this.fetchData({order:orderValue, field:fieldValue}).then(data => this._replaceData(data));
  }



  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
    this.element = null;
    this.elementBodyLink = null;
    window.removeEventListener('scroll', this.handleScrollEvent);
    document.removeEventListener('pointerdown', this.handleSortEvent);
  }

  getTemplate () {
    return `
    <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getTemplateTableHeader()}
            </div>

            <div data-element="body" class="sortable-table__body">

            </div>
        </div>
     </div>
    `;
  }

  getTemplateTableHeader () {
    return this.headerConfig.map(item => {
      return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order=${this.defaultSort.order || 'asc'}>
            <span>${item.title}</span>
            ${this.getArrowSpan(item.sortable)}
        </div>
      `;
    }).join('');
  }

  getTemplateTableBody (sortedData) {
    return sortedData.map(item =>{
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.headerConfig.map(itemConf => {
        return itemConf.template(item);
      }).join('')}
        </a>
      `;
    }).join('');
  }

  getSortType (field) {
    for (const item of this.headerConfig) {
      if (item.id === field) {
        if (item.sortable) {
          return item.sortType;
        }
      }
    }

  }

  sortByType (type, a, b) {
    if (type === 'number') {return a - b;}
    if (type === 'string') {return a.localeCompare(b, ['ru', 'en'], {'caseFirst': 'upper'});}
  }

  getDefaultTemplate (itemObj) {
    return `<div class="sortable-table__cell">${itemObj[this.id]}</div>`;
  }

  parseConfig () {
    for (const confEl of this.headerConfig) {
      if (!confEl.template) {
        confEl.template = this.getDefaultTemplate;
      }
    }

  }

  getArrowSpan (sortable) {
    if (sortable) {
      return `
        <span data-element="arrow" class="sortable-table__sort-arrow" style="opacity: 0">
          <span class="sort-arrow"></span>
        </span>
      `;
    }
    else {
      return '';
    }
  }


  fetchData ({
    order = this.defaultSort.order,
    field = this.defaultSort.id,
    start = this.start,
    end = this.end,
    options = this.defaultSort.options
  }={}) {
    this.elementBodyLink.parentElement.classList.add('sortable-table_loading');
    const url = new URL(this.url);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);
    url.searchParams.set('_order', order);
    url.searchParams.set('_sort', field);
    for (const param in options) {
      url.searchParams.set(param, options[param]);
    }
    if (this.isSortLocally)
      return fetchJson(url).then(data => this.data = data);
    return fetchJson(url);
  }

  update (...args) {
    // this.element.querySelector('.column-chart').classList.add('column-chart_loading');
    if (!args.length) {
      this.fetchData().then(data => this._replaceData(data));
      return;
    }
    if (args[0] instanceof Array) {
      this._replaceData(args[0]);
      return;
    }
    if (args[0] instanceof Date) {
      this.fetchData({start: args[0], end: args[1]}).then(data => this._replaceData(data));
    }

  }

  _addData (dataArray) {
    // this.element.querySelector('.column-chart').classList.remove('column-chart_loading');

    this.elementBodyLink.insertAdjacentHTML('beforeend', this.getTemplateTableBody(dataArray));
    this.elementBodyLink.parentElement.classList.remove('sortable-table_loading');
  }

  _replaceData (dataArray) {
    this.elementBodyLink.innerHTML = this.getTemplateTableBody(dataArray);
    this.isLoading = false;
    this.elementBodyLink.parentElement.classList.remove('sortable-table_loading');
  }

  _refreshInitialData (options = {}) {
    this.start = options.start || 0;
    this.end = options.end || this.chunk;

  }


}

const CHUNK_VALUE = 30;
