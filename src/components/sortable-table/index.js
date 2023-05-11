import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {

  constructor(headersConfig, {
    url = "",
    data = [],
    isSortLocally = false,
    sorted =  {id: headersConfig.find((item) => item.sortable).id, order: "asc"},
    range = {},
    hrefPath = "",
    params = {},
  } = {}) {

    this.headerConfig = headersConfig;
    this.data = data;
    this.sortedId = sorted.id;
    this.sortedOrder = sorted.order;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.start = 0;
    this.limit = 30;
    this.scrolling = false;
    this.range = range;
    this.hrefPath = hrefPath;
    this.params = params;

    this.render();  

  }

  sortOnClient(id, order) {

    this.sortedOrder = order;
    this.sortedId = id;      
    this.subElements.body.innerHTML = this.getRows(this.sortData(this.sortedId, this.sortedOrder));

  }

  async sortOnServer(id, order) {

    this.sortedOrder = order;
    this.sortedId = id; 
    this.start = 0;  

    const newData = await this.loadData();

    this.subElements.body.innerHTML = this.getRows(newData);

  }

  async render() {    

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getHTML();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    
    this.subElements.header.addEventListener('pointerdown', this.pointerDownHandler);
    document.addEventListener("scroll", this.onScroll);

    const newData = await this.loadData();

    if (newData.length) {
      this.element.classList.remove("sortable-table_empty");
      this.data = newData; 
      this.subElements.body.innerHTML = this.getRows(this.data);
    } else {
      this.element.classList.add("sortable-table_empty");
    }         

  }

  async update(from, to){
    const keys = Object.keys(this.range);
    this.range[keys[0]] = from;
    this.range[keys[1]] = to;
    this.data = await this.loadData();
    this.subElements.body.innerHTML = this.getRows(this.data);
  }

  async filter(){
    this.data = await this.loadData();
    this.subElements.body.innerHTML = this.getRows(this.data);
  }

  async loadData() {
    
    this.element.classList.add("sortable-table_loading");

    Object.entries(this.range).map(([key, value]) => this.url.searchParams.set(key, value.toISOString()));
    Object.entries(this.params).map(([key, value]) => this.url.searchParams.set(key, value));
    this.url.searchParams.set("_sort", this.sortedId);
    this.url.searchParams.set("_order", this.sortedOrder);
    this.url.searchParams.set("_start", this.start);
    this.url.searchParams.set("_end", this.start + this.limit);      

    const newData = await fetchJson(this.url);    

    this.element.classList.remove("sortable-table_loading");

    return newData;

  }

  getHTML() {  
      
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerConfig.map(item => this.getHeader(item)).join('')}
        </div>
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>No data</div>
        </div>
      </div>`;

  }

  getHeader({title, id, sortable}) {

    const order = id === this.sortedId ? this.sortedOrder : "";
    return `<div data-element="title" class="sortable-table__cell" data-id=${id} data-sortable=${sortable} data-order=${order}>
      <span>${title}</span>
      ${this.getArrow(order)}
    </div>`;
  }

  getArrow(order){
    if(order === '') return '';
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;
  }


  getRows(data = []) {

    return data.map(rowObject => {
      const rowBegin = this.hrefPath ? `<a href="${this.hrefPath}${rowObject.id}"` : `<a`;
      return `${rowBegin} class="sortable-table__row">
      ${this.headerConfig.map(item => {
        const value = rowObject[item.id] === undefined ? '' : rowObject[item.id];
        return item.template !== undefined ? item.template(value) : `<div class="sortable-table__cell">${value}</div>`;
      }).join('')}
      </a>`;
    }).join('');

  }

  sortData(fieldValue, orderValue){

    const sortingElem = this.headerConfig.find(field => field.id === fieldValue);

    if (sortingElem === undefined || !sortingElem.sortable) return;

    const dirArr = {asc: 1, desc: -1};
    const sortingDirection = dirArr[orderValue];
    const copyData = [...this.data];    
    const {sortType} = sortingElem;
    
    copyData.sort((a, b) => {
      if (sortType === 'string'){
        return sortingDirection * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']);
      } else {
        return sortingDirection * (a[fieldValue] - b[fieldValue]);
      }
    });

    return copyData;
    
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

  pointerDownHandler = (event) => {

    const column = event.target.closest('[data-sortable="true"]'); 
    
    if (column) {

      const id = column.dataset.id;
      const newOrder  = this.sortedOrder === 'asc' ? 'desc' : 'asc';
      column.dataset.order = newOrder;
      const arrow = column.querySelector('.sortable-table__sort-arrow');
      
      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }

    }
  }

  onScroll = async () => {

    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
   
    if (!this.isSortLocally && !this.scrolling && windowRelativeBottom < document.documentElement.clientHeight + 100) {
     
      this.start = this.start + this.limit + 1;
      this.scrolling = true;

      const newData = await this.loadData();

      if (Object.prototype.toString.call(newData) === '[object Object]') {
        this.isSortLocally = true;
      } else {          
        this.data = [...this.data, ...newData];
        const rows = document.createElement("div");

        rows.innerHTML = this.getRows(newData);      
        this.subElements.body.append(...rows.childNodes);  
      } 
      
      this.scrolling = false;
      
    }
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    document.removeEventListener("scroll", this.onScroll);
  }
}
