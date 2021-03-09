import fetchJson from '../../utils/fetch-json';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  step = 30;
  start = 1;
  end = this.start + this.step;
  loading = false;

  onSortClick = (evt) => {
    const column = evt.target.closest('[data-sortable="true"]');

    const toggleDirection = (direction) => {
      const directions = {
        asc: 'desc',
        desc: 'asc',
      }
      return directions[direction];
    };

    if (column) {
      const {id, order} = column.dataset;
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      const newOrder = toggleDirection(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      if (this.isSortLocally) {
        this.sortDataLocally(id, toggleDirection(order))
        this.subElements.body.innerHTML = this.getTableRowsTemplate(this.data);
      } else {
        this.sortOnServer(id, toggleDirection(order), this.start, this.end);
      }
    }
  }

  onWindowScroll = async () => {
    const {bottom} = this.element.getBoundingClientRect();
    const {id, order} = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      this.data = await this.getData(id, order, this.start, this.end);

      this.update(this.data);

      this.loading = false;
    }
  }

  constructor(header = [], {
    url = '',
    sorted = {
      id: header.find(item => item.sortable).id,
      order: 'asc',
    },
    isSortLocally = false,
    start = 1,
    step = 30,
    end = start + step,
  } = {}) {
    this.header = header;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.start = start;
    this.step = step;
    this.end = end;

    this.render();
  }

  async getData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const response = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return response;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  getHeaderTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.header.map((item) => {

      const direction = this.sorted.id === item.id ? this.sorted.order : 'asc';

      return `<div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable} data-order=${direction}>
                <span>${item.title}</span>
                ${this.getSortingArrowTemplate(item.id)}
              </div>`
    }).join('')}

      </div>
    `;
  }

  getTableRowsTemplate(data) {
    return data.map((item) => {
      return `<a href="/products/${item.id}" class="sortable-table__row">
                ${this.getTableRow(item)}
              </a>`
    }).join('');
  }

  getTableRow(item) {
    const cells = this.header.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      if (id === 'createdAt') {
        item[id] = new Date(item[id]).toLocaleDateString('ru', {year: 'numeric', month: 'long', day: 'numeric'})
      }

      if (id === 'subcategory') {
        item[id] = item[id].title;
      }

      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join('');
  }

  getTableBodyTemplate(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRowsTemplate(data)}
      </div>
    `;
  }

  getSortingArrowTemplate(id) {
    const isOrderExists = this.sorted.id === id ? this.sorted.order : '';
    return isOrderExists ?
      `<span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`
      : ``;
  }

  getTable() {
    return `
        <div class="sortable-table">
            ${this.getHeaderTemplate()}
            ${this.getTableBodyTemplate(this.data)}

            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
              <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
              </div>
            </div>
        </div>
    `
  }

  async render() {
    const {id, order} = this.sorted;
    const elementWrapper = document.createElement('div');

    elementWrapper.innerHTML = this.getTable();

    this.element = elementWrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.data = await this.getData(id, order, this.start, this.end);

    this.subElements.body.innerHTML = this.getTableRowsTemplate(this.data);
    this.initEventListeners();
  }

  sortDataLocally(id, order) {
    const sortedArr = [...this.data];
    const targetColumn = this.header.find((item) => item.id === id);
    const {sortType} = targetColumn;
    const sortingDirection = order === 'asc' ? 1 : -1;

    this.data = sortedArr.sort((a, b) => {
      switch (sortType) {
        case 'string':
          return sortingDirection * a[id].localeCompare(b[id], 'ru-en', {caseFirst: 'upper'});
        case 'number':
          return sortingDirection * (a[id] - b[id]);
        default:
          return sortedArr;
      }
    })
  }

  async sortOnServer(id, order, start, end) {
    this.data = await this.getData(id, order, start, end);
    this.subElements.body.innerHTML = this.getTableRowsTemplate(this.data);
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRowsTemplate(data);

    this.subElements.body.append(...rows.childNodes);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {})
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    document.removeEventListener('scroll', this.onWindowScroll);
  }
}
