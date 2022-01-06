import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  data = [];
  element;
  subElements;
  arrowElement;
  filters = {};
  directions = {
    asc: 1,
    desc: -1
  };
  offset = 50;
  loading = false;
  loadOnScrollAvailable = true;

  constructor(headerConfig = [], {
    url = '',
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 30,
    start = 0
  } = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.start = start;
    this.step = step;
    this.end = this.start + this.step;

    this.render();
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        ${this.getTable()}
      </div>
    `;
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    for (const [key, value] of Object.entries(this.filters)) {
      if (value || value === 0) {
        this.url.searchParams.set(key, value.toString());
      }
    }

    this.subElements.table.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.subElements.table.classList.remove('sortable-table_loading');

    this.loadOnScrollAvailable = data.length === this.step;

    return data;
  }

  addOrderToCell(field, order) {
    const headerCell = this.subElements.header.querySelector(`[data-id=${field}]`);
    if (headerCell) {
      headerCell.append(this.arrowElement);
      headerCell.setAttribute('data-order', order);
    }
  }

  sort(field, order) {
    const orderedCell = this.subElements.header.querySelector(`[data-order]`);
    if (orderedCell) {
      orderedCell.removeAttribute('data-order');
    }

    this.addOrderToCell(field, order);

    this.start = 0;
    this.sorted = {
      id: field,
      order: order
    };

    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnServer = async (field, order) => {
    this.end = this.step;
    const data = await this.loadData(field, order, this.start, this.step);
    this.update(data, false);
  }

  sortOnClient(field, order) {
    const sortFieldConfig = this.headerConfig.find(item => item.id === field);
    const sortType = sortFieldConfig ? sortFieldConfig.sortType : 'number';
    const direction = this.directions[order];

    const sortedData = [...this.data].sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
      }
    });

    this.update(sortedData, false);
  }

  getTableHead() {
    const headerCells = this.headerConfig.map(cell => {
      return `
        <div class="sortable-table__cell" data-id="${cell.id}" data-sortable="${cell.sortable}">
          <span>${cell.title}</span>
        </div>
      `;
    });

    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headerCells.join('')}
      </div>
    `;
  }

  getTableRow(item) {
    const itemCells = this.headerConfig.map(cell => {
      return cell.template ? cell.template(item[cell.id]) : `
        <div class="sortable-table__cell">${item[cell.id]}</div>
      `;
    });

    return `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${itemCells.join('')}
      </a>
    `;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getRowsHtml()}
      </div>
    `;
  }

  getTable() {
    return `
      <div data-element="table" class="sortable-table sortable-table_loading">
        ${this.getTableHead()}
        ${this.getTableBody()}

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

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getRowsHtml(data = this.data) {
    const rows = data.map(item => {
      return this.getTableRow(item);
    });
    return rows.join('');
  }

  render = async () => {
    const {id, order} = this.sorted;
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const arrowContainer = document.createElement('div');
    arrowContainer.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
    this.arrowElement = arrowContainer.firstElementChild;

    const data = await this.loadData(id, order, this.start, this.end);

    this.update(data);
    this.addOrderToCell(id, order);
    this.addEventListener();
  }

  addEventListener() {
    this.subElements.header.addEventListener('pointerdown', this.onSortableCellClick);
    window.addEventListener('scroll', this.onWindowScroll);
  }

  onSortableCellClick = (event) => {
    if (event.target.closest('[data-sortable="true"]')) {
      const field = event.target.closest('[data-sortable]').dataset.id;
      const currentOrder = this.subElements.header.querySelector(`[data-order]`);
      const targetOrder = currentOrder ? this.getTargetOrder(currentOrder.dataset.order) : 'asc';

      this.sort(field, targetOrder);
    }
  }

  onWindowScroll = async () => {
    if (this.element) {
      const { bottom } = this.element.getBoundingClientRect();

      if (this.loadOnScrollAvailable && !this.isSortLocally && !this.loading && bottom < document.documentElement.clientHeight) {
        const { id, order } = this.sorted;

        this.start = this.end;
        this.end = this.start + this.step;

        this.loading = true;

        const data = await this.loadData(id, order, this.start, this.end);
        this.update(data);

        this.loading = false;
      }
    }
  }

  update(data, isAppend = true) {
    if (data && Object.values(data).length) {
      this.subElements.table.classList.remove('sortable-table_empty');

      if (isAppend) {
        this.subElements.body.innerHTML += this.getRowsHtml(data);
      } else {
        this.subElements.body.innerHTML = this.getRowsHtml(data);
      }
    } else if (!isAppend) {
      this.subElements.table.classList.add('sortable-table_empty');
    }

    this.data = data;
  }

  getTargetOrder(currentOrder) {
    const obj = {
      asc: 'desc',
      desc: 'asc'
    };

    return obj[currentOrder];
  }

  destroy() {
    if (this.element) {
      this.element.remove();
    }
    window.removeEventListener('scroll', this.onWindowScroll);
    this.element = null;
  }
}
