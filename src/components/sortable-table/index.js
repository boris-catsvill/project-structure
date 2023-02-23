import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  range = {from : null, to: null};

  onClick = (event) => {    
    const headerElement = event.target.closest(".sortable-table__cell");

    if (!(headerElement && headerElement.dataset.sortable === "true")) return;

    this.orderValue = this.orderValue === "asc" ? "desc" : "asc";
    this.fieldValue = headerElement.dataset.id;

    this.sort();
  };

  onScroll = async () => {
    const rect = this.element.getBoundingClientRect();

    if (rect.bottom < document.documentElement.clientHeight && !this.loading  && !this.isSortLocally) {

      this.start = this.end + 1;
      this.end = this.start + this.step - 1;

      this.loading = true;

      const data = await this.getData(this.start, this.end);

      this.update(data);

      this.loading = false;

    }
  }

  constructor(headersConfig, {
    url = '',
    data = [],
    isSortLocally = false,
    step = 30,
    start = 0,
    sorted = {id: headersConfig.find(items => items.sortable).id, order:'asc'},
    range = {from:null, to:null}
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.isSortLocally = isSortLocally;
    this.start = start;
    this.step = step;
    this.end = start + step - 1;
    this.fieldValue = sorted.id;
    this.orderValue = sorted.order;
    this.url  = url,
    this.range = range;
    this.render();
  }

  async render() {
    const wraper = document.createElement("div");
    wraper.innerHTML = this.getTableTemplate();
    this.element = wraper.firstElementChild;
    this.subElements = this.getSubElements();

    const data = await this.getData();
    this.update(data);

    this.subElements.header.addEventListener("pointerdown", this.onClick);
    window.addEventListener('scroll', this.onScroll);

    /*
    this.abort = new AbortController();

    this.subElements.header.addEventListener("pointerdown", this.onClick, { signal: this.abort.signal });
    window.addEventListener('scroll', this.onScroll, { signal: this.abort.signal });
    */
  }

  getTableTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
        </div>

        <div data-element="body" class="sortable-table__body">
        </div>
        
        <div data-element="loading" class="loading-line sortable-table__loading-line">
        </div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  getHeaderTemplate() {
    return this.headersConfig
      .map((item) => {
        let order = "";
        let arrow = "";

        if (this.fieldValue === item.id) {
          order = this.orderValue;
          arrow = this.getSortArrow();
        }

        return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${order}">
          <span>${item.title}</span>
          ${arrow}
        </div>
        `;
      })
      .join("\n");
  }

/*
<span data-tooltip="
        <div class="sortable-table-tooltip">
          <span class="sortable-table-tooltip__category">ТВ и Развлечения</span> /
          <b class="sortable-table-tooltip__subcategory">Игры и хобби</b>
        </div>">Игры и хобби</span>
        */

  getBodyTemplate(data = []) {
    return data
      .map((item) => {
        return `
      <a href='/products/${item.id}' class='sortable-table__row'>
        ${this.headersConfig
          .map((column) => {
            if ('template' in column) return column.template(item.images);
            const cellValue = ('subcategory' === column.id) ? item.subcategory.title : item[column.id];
            return `<div class='sortable-table__cell'>${cellValue}</div>`;
          })
          .join("\n")}
      </a>
      `;
      })
      .join("\n");
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  getSortArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  sortData() {
    return this.data.sort((a, b) => {
      [a, b] = [a[this.fieldValue], b[this.fieldValue]];
      if (this.orderValue === "desc") {
        [b, a] = [a, b];
      }

      const sortType = this.headersConfig.find(
        (item) => item.id === this.fieldValue
      ).sortType;

      switch(sortType) {
        case 'string' : return a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
        case 'date' : return new Date(a) - new Date(b);
        case 'number' : return a - b;
        default: return;
      }

    });
  }

  update(data) {
    this.subElements.header.innerHTML = this.getHeaderTemplate();

    this.data = [...this.data, ...data];

    const rows = document.createElement('div');
    rows.innerHTML = this.getBodyTemplate(data);
    this.subElements.body.append(...rows.childNodes);

  }

  sort() {
    this.subElements.body.innerHTML = this.getBodyTemplate([]);
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient () {
    const data = this.sortData();
    this.data = [];
    this.update(data);
  }

  async sortOnServer () {
    this.data = [];
    const data = await this.getData();
    this.update(data);
  }

  async getData(start = 0, end = this.step - 1) {
    const sort = this.fieldValue;
    const order = this.orderValue;
    const {from, to} = this.range;

    const url = new URL(BACKEND_URL);
    url.pathname = this.url;
    url.searchParams.set('_sort', sort);
    url.searchParams.set('_order',order);
    url.searchParams.set('_start',start);
    url.searchParams.set('_end', end);    

    if (from) url.searchParams.set('from', from.toISOString());
    if (to) url.searchParams.set('to', to.toISOString());   
    

    this.element.classList.add('sortable-table_loading');
    const data = fetchJson(url);
    this.element.classList.remove('sortable-table_loading');
    return data;
  }

  async setRange(from = null, to = null){
    this.range = {from, to};

    this.loading = true;
    this.data = [];
    const data = await this.getData();

    this.subElements.body.innerHTML ='';
    this.update(data);

    this.loading = false;
  }


  remove() {
    if (this.element) {
      this.subElements.header.removeEventListener("pointerdown", this.onClick);
      this.element.remove();      
    }
  }

  destroy() {
    window.removeEventListener('scroll', this.onScroll);
    this.remove();
  }


}
