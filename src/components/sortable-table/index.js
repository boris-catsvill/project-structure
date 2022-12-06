import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  data = [];
  columnListSize = 0;
  subElements = {};
  newLength = 30;
  isSortLocally = false;

  constructor(
    headerConfig = [],
    {data, sorted = {id: "title", order: "asc"}, isSortLocally = false, url} = {}
  ) {

    this.headerConfig = headerConfig;
    this.data = data;
    this.fieldValue = sorted["id"];
    this.orderValue = sorted["order"];
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);

    this.render();
    this.createListener();

    if (!isSortLocally) {
      this.sortOnServer();
      this.createListenerForServer();
    }
  }

  createListener() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  createListenerForServer() {
    this.state = true;
    window.addEventListener('scroll', this.onWindowScroll)
  }

  onWindowScroll = event => {
    if (this.element.clientHeight - (pageYOffset + window.innerHeight) < 0 && this.state === true) {
      this.state = false;
      this.sortOnServer();
    }
  }

  onSortClick = event => {
    this.columnListSize = 0;
    const column = event.target.closest('[data-sortable="true"]');
    if (column) {
      this.callBackForListener(this.renderSort(), column);
    }
  }

  callBackForListener(orderElem, column) {
    if (column.getAttribute('data-order')) {
      const order = column.dataset.order = (column.getAttribute('data-order') === 'asc')
        ? 'desc'
        : 'asc'
      this.sort(column.getAttribute('data-id'), order);
    } else {
      this.element.querySelectorAll('.sortable-table__header .sortable-table__cell').forEach(item => {
        item.removeAttribute('data-order');
        if (item.querySelector('.sortable-table__sort-arrow')) {
          item.querySelector('.sortable-table__sort-arrow').remove();
        }
      });
      column.dataset.order = 'asc';
      column.append(orderElem);
      this.sort(column.getAttribute('data-id'), 'asc');
    }
  }

  getTemplate() {

    return `
        <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeaderList()}
        </div>
            ${this.getBodyList()}
        </div>

    `
  }

  getHeaderList() {
    return this.headerConfig.map(column => {
        if (this.fieldValue === column['id']) {
          return `
          <div class="sortable-table__cell" data-id="${column['id']}" data-sortable="${column['sortable']}" data-order="${this.orderValue}">
            <span>${column['title']}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
          </div>
          `
        } else {
          return `
          <div class="sortable-table__cell" data-id="${column['id']}" data-sortable="${column['sortable']}">
            <span>${column['title']}</span>
          </div>
          `
        }
      }
    ).join("");

  }

  getBodyList() {
    return `
        <div data-element="body" class="sortable-table__body">
                ${this.sortData(this.data).map(item => {
        return `
                    <a href="#" class="sortable-table__row">
                      ${this.getTableRow(item)}
                    </a>
                    `;
      }
    ).join("")}
        </div>`
  }

  sortData(data = []) {
    const arr = [...data];
    const directions = {
      asc: 1,
      desc: -1
    };

    const comp = (a, b) => {
      switch (typeof (a[this.fieldValue])) {
        case "string" :
          return a[this.fieldValue].localeCompare(b[this.fieldValue], ['ru', 'en'], {
            sensitivity: 'variant',
            caseFirst: 'upper'
          }) * directions[this.orderValue];

        case "number" :
          return (a[this.fieldValue] - b[this.fieldValue]) * directions[this.orderValue];
      }
    }

    return arr
      .sort((a, b) => {
        return comp(a, b)
      })
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join("");
  }


  sort(column, order) {
    if (this.isSortLocally) {
      this.sortOnClient(column, order);
    } else {
      this.sortOnServer(column, order);
    }
  }

  sortOnClient(fieldValue = this.fieldValue, orderValue = this.orderValue) {
    this.fieldValue = fieldValue;
    this.orderValue = orderValue;

    this.sortData(this.data);

    this.subElements.body.innerHTML = this.getBodyList();
  }

  async sortOnServer(fieldValue = this.fieldValue, orderValue = this.orderValue, from, to) {

    this.fieldValue = fieldValue;
    this.orderValue = orderValue;

    try {
      this.data = await this.loadData(fieldValue, orderValue, from, to);
    } catch (error) {
      console.log(error.message);
    }

    if (this.state === true) {
      this.subElements.body.innerHTML = this.getBodyList();
      this.columnListSize = this.newLength;
    } else {
      this.addColumnList();
    }

    this.state = true;

  }

  async update(from, to){
    this.columnListSize = 0;
    await this.sortOnServer( this.fieldValue, this.orderValue, from, to);
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  async loadData(fieldValue = this.fieldValue, orderValue = this.orderValue, start, end) {
    //this.url.searchParams.set('_embed', 'subcategory.category');
    this.url.searchParams.set('_sort', fieldValue);
    this.url.searchParams.set('_order', orderValue);
    this.url.searchParams.set('_start', this.columnListSize);
    this.url.searchParams.set('_end', this.columnListSize + this.newLength);
    if (start && end) {
      this.url.searchParams.set('from', start.toISOString().split('T')[0]);
      this.url.searchParams.set('to', end.toISOString().split('T')[0]);
    }


    try {
      return await fetchJson(this.url);
    } catch (error) {
      console.log(error.message)
    }
  }

  addColumnList() {
    this.subElements.body.append(...this.renderColumnList());
    this.columnListSize += this.newLength

  }

  renderColumnList() {
    const divColumnList = document.createElement('div');
    divColumnList.innerHTML = this.getBodyList();

    this.columnList = divColumnList.children;
    return this.columnList;
  }

  render() {

    const table = document.createElement('div');

    table.innerHTML = this.getTemplate();
    const element = table.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

  }

  renderSort() {
    const order = document.createElement('div');

    order.innerHTML = `
                    <span data-element="arrow" class="sortable-table__sort-arrow">
                        <span class="sort-arrow"></span>
                    </span>
      `
    return order.firstElementChild;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]')

    for (const subElement of elements) {
      const name = subElement.dataset.element
      result[name] = subElement;
    }
    return result;
  }


  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    window.removeEventListener('scroll', this.onWindowScroll);
  }
}
