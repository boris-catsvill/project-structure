import fetchJson from '../../utils/fetch-json';

export default class SortableTable {
  data = [];
  subElements = {};

  handleScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();

    if (document.documentElement.clientHeight >= bottom && !this.isLoading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.end + this.step;

      const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);

      this.addRows(data);
    }
  };

  handleSort = async event => {
    const cell = event.target.closest('.sortable-table__cell');
    const { id, order, sortable } = cell.dataset;

    if (sortable === undefined) {
      return;
    }

    const newOrder = order === 'desc' ? 'asc' : 'desc';

    this.sorted.id = id;
    this.sorted.order = newOrder;

    this.subElements.body.innerHTML = '';

    if (this.isSortLocally) {
      this.sortOnClient(id, newOrder);
    } else {
      this.sortOnServer(id, newOrder);
    }

    this.orderColumns(id, newOrder);
  };

  constructor(
    headerConfig,
    {
      url = '',
      getRowLink = id => '',
      renderEmpty = () => {
        return `
        <div>
          <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
          <button type="button" class="button-primary-outline" data-element="reset">Сбросить фильтры</button>
        </div>
        `;
      },
      isSortLocally = false,
      sorted = {},
      start = 0,
      step = 20,
      end = start + step
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.getRowLink = getRowLink;
    this.renderEmpty = renderEmpty;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.start = start;
    this.step = step;
    this.end = end;

    this.render();
  }

  getHeader() {
    return `
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.getHeaderRow()}
    </div>`;
  }

  getHeaderRow() {
    return this.headerConfig
      .map(column => {
        return `<div class="sortable-table__cell" data-id="${column.id}"
        ${column.sortable ? 'data-sortable' : ''}
        ${column.id === this.sorted.id ? `data-order='${this.sorted.order}'` : ''}>
        <span>${column.title}</span>
        ${
          column.sortable
            ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
            : ''
        }
      </div>`;
      })
      .join('');
  }

  getBody() {
    return `
    <div data-element="body" class="sortable-table__body">
      ${this.getBodyRows()}
    </div>`;
  }

  getBodyRows(data = this.data) {
    return data
      .map(row => {
        const rowLink = this.getRowLink(row.id);
        const element = rowLink
          ? `<a href='${rowLink}' class='sortable-table__row'>${this.getBodyRow(row)}</a>`
          : `<div class='sortable-table__row'>${this.getBodyRow(row)}</div>`;

        return element;
      })
      .join('');
  }

  getBodyRow(row) {
    return this.headerConfig
      .map(column => {
        const { id, template = value => `<div class='sortable-table__cell'>${value}</div>` } =
          column;

        return template(row[id]);
      })
      .join('');
  }

  getTemplate() {
    return `<div class="sortable-table sortable-table_loading">
      ${this.getHeader()}
      ${this.getBody()}

      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        ${this.renderEmpty()}
      </div>
    </div>`;
  }

  getSortFn(id, order) {
    const colConfig = this.headerConfig.find(col => col.id === id);
    const sortType = colConfig?.sortType;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return (a, b) => {
      switch (sortType) {
        case 'string':
          return (
            direction *
            a[id].localeCompare(b[id], ['ru', 'en'], {
              caseFirst: 'upper'
            })
          );
        default:
          return direction * (a[id] - b[id]);
      }
    };
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();

    const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.step);

    this.setRows(data);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleSort);
    if (this.subElements.reset) {
      this.subElements.reset.addEventListener('pointerdown', () => {
        this.element.dispatchEvent(new CustomEvent('filters-reset'));
      });
    }

    document.addEventListener('scroll', this.handleScroll);
  }

  get isLoading() {
    return this.element.classList.contains('sortable-table_loading');
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  setRows(data) {
    this.data = data;

    if (data.length === 0) {
      this.element.classList.add('sortable-table_empty');
    } else {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.getBodyRows(data);
    }
  }

  addRows(data) {
    const container = document.createElement('div');

    this.data = [...this.data, ...data];
    container.innerHTML = this.getBodyRows(data);

    this.subElements.body.append(...container.children);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const elem of elements) {
      const name = elem.dataset.element;
      result[name] = elem;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.data = [];
    this.subElements = {};
    document.removeEventListener('scroll', this.handleScroll);
  }

  orderColumns(id, order) {
    for (const child of this.subElements.header.children) {
      delete child.dataset.order;

      if (child.dataset.id === id) {
        child.dataset.order = order;
      }
    }
  }

  sortOnClient(id, order) {
    const sortFn = this.getSortFn(id, order);
    this.data.sort(sortFn);
    this.subElements.body.innerHTML = this.getBodyRows(this.data);
  }

  async sortOnServer(id, order) {
    this.start = 0;
    this.end = this.step;
    const data = await this.loadData(id, order, this.start, this.end);
    this.setRows(data);
  }
}
