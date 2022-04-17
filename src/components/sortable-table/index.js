import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 0;
  end = this.start + this.step;
  title_like;
  dataHave = true;

  async updateTable(id = 'title', order = 'asc') {
    this.element.classList.remove('sortable-table_empty');

    this.toggleLoadingLine(true);

    const data = await this.loadData(id, order);
    this.renderRows(data);

    this.toggleLoadingLine(false);
  }

  toggleLoadingLine(bool) {
    const { body, loading } = this.subElements;

    body.style.display = bool ? "none" : "block";
    loading.style.display = bool ? "block" : "none";

  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (
      bottom < document.documentElement.clientHeight &&
      !this.loading &&
      !this.isSortLocally &&
      this.dataHave
    ) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order);

      if (data.length) {
        this.update(data);
      } else {
        this.dataHave = false;
      }

      this.loading = false;
    }
  };

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortLocally(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  constructor(
    headersConfig = [],
    {
      url = '',
      sorted = {
        id: headersConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      isSortLocally = false
    } = {}
  ) {
    this.headersConfig = headersConfig;
    this.url = new URL(url, `${process.env.BACKEND_URL}`);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const { id, order } = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order);

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData(id = 'title', order = 'asc') {
    await this.createURL(id, order);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  createURL(id, order) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.end);
    this.url.searchParams.set('_embed', 'subcategory.category');

    this.price_gte
      ? this.url.searchParams.set('price_gte', this.price_gte)
      : this.url.searchParams.delete('price_gte');

    this.price_lte
      ? this.url.searchParams.set('price_lte', this.price_lte)
      : this.url.searchParams.delete('price_lte');

    this.title_like
      ? this.url.searchParams.set('title_like', this.title_like)
      : this.url.searchParams.delete('title_like');

    this.status
      ? this.url.searchParams.set('status', this.status)
      : this.url.searchParams.delete('status');
  }

  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data
      .map(
        item => `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </a>`
      )
      .join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({ id, template }) => {
      return {
        id,
        template
      };
    });

    return cells
      .map(({ id, template }) => {
        return template
          ? template(item[id])
          : `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join('');
  }

  getTable() {
    return `
      <div class="sortable-table">

        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">

            <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
            <button type="button" class="button-primary-outline">Очистить фильтры</button>

        </div>
      </div>`;
  }

  initEventListeners() {
    const { emptyPlaceholder } = this.subElements;

    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);

    emptyPlaceholder.addEventListener('pointerdown', event => {
      const btnReset = event.target.closest('button');
      if (!btnReset) return;

      this.element.dispatchEvent(new CustomEvent('reset-filters', { bubbles: true }));
    });
  }

  sortLocally(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(id, order) {
    this.toggleLoadingLine(true);

    const data = await this.loadData(id, order);

    this.renderRows(data);

    this.toggleLoadingLine(false);
  }

  renderRows(data) {
    if (data.length) {
      this.addRows(data);
    } else {
      this.subElements.body.innerHTML = '';
      this.element.classList.add('sortable-table_empty');
    }
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const { sortType, customSorting } = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
    document.removeEventListener('scroll', this.onWindowScroll);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
