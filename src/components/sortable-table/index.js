import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  start = 1;
  step = 20;
  end = this.start + this.step;
  loading = false;

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc',
    },
    start = 1,
    step = 20,
    end = start + step,
    isSortLocally = false
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.start = start;
    this.step = step;
    this.end = end;
    this.isSortLocally = isSortLocally;

    this.render(); 
  }

  getTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getColumnHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
            
          </div>
        </div>
      </div>
    `
  }

  getColumnHeader() {
    return this.headersConfig.map(item => {
        return `
          <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="">
            <span>${item.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow"> <span class="sort-arrow"></span> </span>
          </div>
        `
    }).join("");
  }


  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTemplate();

    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    
    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  renderRows(data) {
    if(data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.getTableBody(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  getTableBody(arr) {
    return arr.map(item => {
      return `
        <a href='/products/${item.id}' class="sortable-table__row">
          ${this.headersConfig.map(elem => {
            if(elem.id === 'images') return elem.template(item.images);

            return `
              <div class="sortable-table__cell">${item[elem.id]}</div>
            `
          }).join("")}
        </a>
      `
    }).join("");
  }

  scroll = async () => {
    const {bottom} = this.element.getBoundingClientRect();
    const {id, order} = this.sorted;

    if(bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);

      this.update(data);

      this.loading = false;
    }
  }

  update(data) {
    this.subElements.body.innerHTML = '';
    const rows = document.createElement('div');
    rows.innerHTML = this.getTableBody(data);
    this.subElements.body.append(...rows.childNodes)
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortClick);

    window.addEventListener('scroll', this.scroll);
  }

  sortClick = (event) => {
    const target = event.target.closest('[data-sortable="true"]');

    if(!target) return;

    if(target === null) return;
    const { id, order } = target.dataset;
    let newOrder = order === 'desc' ? 'asc' : 'desc';

    if (this.isSortLocally) {
      this.sortOnClient(id, newOrder);
    } else {
      this.sortOnServer(id, newOrder);
    }
  }

  sortOnClient(id, order) { 
    this.sort(id, order);
  }

  async sortOnServer(id, order) {
    this.sortColumn(id, order);
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  sortColumn(id, order) {
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);

    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
  }

  async sort(id, order) {
    const arr = await this.sortData(id, order);

    this.sortColumn(id, order);

    this.subElements.body.innerHTML = this.getTableBody(arr);
  }

  async sortData(field, order) {
    const newArr = await this.loadData(field, order, this.start, this.end);
    const column = this.headersConfig.find(j => j.id === field);

    const directions = {
      asc: 1,
      desc: -1
    }
    const direction = directions[order];

    return newArr.sort((a, b) => {
      if (column.sortType === 'string') {
        return direction * (a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper', sensitivity: 'case'}));
      } else if (column.sortType === 'number') {
        return direction * (a[field] - b[field])
      }
    })
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

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    if (this.subElements.header) {
      this.subElements.header.removeEventListener('pointerdown', this.callBack)
    }
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
