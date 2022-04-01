import fetchJson from "../../utils/fetch-json.js";
import NotificationMessage from '../notification';

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {
  subElements = {};
  pageSize = 30;
  onWindowScroll = () => {
    if (this.element.classList.contains("sortable-table_loading") || this.endOfData || this.isSortLocally)
      return;
    if (this.element.getBoundingClientRect().bottom < document.documentElement.clientHeight) {

      this.loadData(this.sorted.id, this.sorted.order)
        .then((data) => {
          const replace = false;
          this.update(data, replace);
          this.element.classList.remove("sortable-table_loading");
        })
        .catch(error => {
          const notification = new NotificationMessage('Ошибка получения данных', {
            duration: 2000,
            type: 'error'
          });
        });

    }
  };
  handleClick = (event) => {
    const element = event.target.closest('[data-sortable="true"]');
    if (!element) return;
    let order ;
    switch (element.dataset.order) {
    case 'asc':
      order = 'desc';
      break;
    case 'desc':
      order = 'asc';
      break;
    default:
      order = 'asc';
    }
    this.sort(element.dataset.id, order).then(r => r);
  };
  constructor(headerConfig = [], {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    url = '',
  } = {}) {
    this.headerConfig = headerConfig;
    this.url = typeof url === 'string'? new URL(url, BACKEND_URL): url;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.render().then(() => this.initEventListeners());
  }
  getTemplate () {
    return `<div data-element="productsContainer" class="products-list__container">
  <div class="sortable-table">
  <div data-element="header" class="sortable-table__header sortable-table__row"></div>
  <div data-element="body" class="sortable-table__body"></div>
  <\div><\div>`;
  }
  renderHeaders (sortColumn, order) {
    const headerArr = [];
    for (const obj of this.headerConfig) {
      let arrowTemplate = '';
      let orderType = '';
      if (obj.id === sortColumn) {
        arrowTemplate = `<span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
        </span>`;
        orderType = order;
      }
      headerArr.push(`<div class="sortable-table__cell" data-id="${obj.id}" data-sortable="${obj.sortable}" data-order="${orderType}">
      <span>${obj.title}</span>${arrowTemplate}
      </div>`);
    }
    return headerArr.join('');
  }

  renderBody (data) {
    const bodyArr = [];
    for (const obj of data) {
      bodyArr.push(`<a href="/products/${obj.id}" class="sortable-table__row">
        ${this.headerConfig
        .filter(item => obj[item.id])
        .map(el => el.template ? el.template(obj[el.id]) : `<div class="sortable-table__cell">${obj[el.id]}</div>`)
        .join('')}
        </a>`);
    }
    return bodyArr.join('');
  }
  getSubElements(element) {
    const arr = element.querySelectorAll('[data-element]');
    for (const elem of arr) {
      this.subElements[elem.dataset.element] = elem;
    }
  }
  async render() {
    const {id, order} = this.sorted;
    const element = document.createElement('div'); // (*)
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.getSubElements(this.element);
    this.data = await this.loadData(id, order);
    this.getTable(id, order);
  }

  async loadData(id, order) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set("_start", this.data.length);
    this.url.searchParams.set("_end", this.data.length + this.pageSize);
    this.element.classList.add("sortable-table_loading");
    const data = await fetchJson(this.url);
    this.endOfData = !data.length;
    this.element.classList.remove("sortable-table_loading");
    return data;
  }
  update(data, replace = true) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.renderBody(data);

    if (replace) this.subElements.body.innerHTML = '';
    this.subElements.body.append(...rows.childNodes);
  }

  initEventListeners () {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);
    document.addEventListener("scroll", this.onWindowScroll);
  }
  sortOnClient(id, order) {
    const directions = {
      asc: -1,
      desc: 1
    };
    const direction = directions[order];
    const sortType = this.headerConfig.find(item => item.id === id).sortType;
    this.data.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], ['ru', 'en']);
      default:
        return direction * (a[id] - b[id]);
      }

    });
    this.getTable(id, order);
  }

  async sortOnServer(id, order) {
    this.data = await this.loadData(id, order);
    this.getTable(id, order);
  }

  async sort(id, order) {
    !this.isSortLocally ? await this.sortOnServer(id, order) : this.sortOnClient(id, order);
  }
  getTable (id, order) {
    this.subElements.header.innerHTML = this.renderHeaders(id, order);
    this.subElements.body.innerHTML = this.renderBody(this.data);
    this.element.classList.remove("sortable-table_loading");
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener("scroll", this.onWindowScroll);
    this.subElements.header.removeEventListener('pointerdown', this.handleClick);
  }

}
