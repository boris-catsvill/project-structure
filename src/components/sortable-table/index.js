import fetchJson from '../../utils/fetch-json';
import { BaseComponent } from '../../base-component';
import { DEFAULT_LIMIT } from '../../constants';

export default class SortableTable extends BaseComponent {
  #limit;
  #isLoading;
  #isSortLocally;

  constructor(
    headerConfig = [],
    {
      data = [],
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      isSortLocally = false,
      limit = DEFAULT_LIMIT,
      url = '',
      isLoading = false
    } = {}
  ) {
    super();
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.#isSortLocally = isSortLocally;
    this.#limit = limit;
    this.#isLoading = isLoading;
    this.render();
  }

  get isLoading() {
    return this.#isLoading;
  }

  set isLoading(isLoading) {
    if (isLoading) {
      this.element.classList.remove('sortable-table_empty');
      this.element.classList.add('sortable-table_loading');
    } else {
      this.element.classList.remove('sortable-table_loading');
    }
    this.#isLoading = isLoading;
  }

  get isEmpty() {
    return !this.data.length;
  }

  set isEmpty(empty) {
    if (empty) {
      this.element.classList.add('sortable-table_empty');
      this.element.classList.remove('sortable-table_loading');
    } else {
      this.element.classList.remove('sortable-table_empty');
    }
  }

  get template() {
    return `
      <div class='sortable-table sortable-table_loading'>
        ${this.getTableHeader()}
        ${this.getTableBody()}
        ${this.getLoading()}
        ${this.getEmptyPlaceholder()}
     </div>`;
  }

  onSortClick({ target }) {
    const column = target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id: newId } = column.dataset;
      const { id, order } = this.sorted;
      const newOrder = id === newId ? toggleOrder(order) : order;

      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }
      this.sorted = { id: newId, order: newOrder };

      if (this.#isSortLocally) {
        this.sortOnClient(newId, newOrder);
      } else {
        this.sortOnServer(newId, newOrder);
      }
    }
  }

  getTableHeader() {
    return `<div data-element='header' class='sortable-table__header sortable-table__row'>
                ${this.headerConfig.map(item => this.getHeaderCell(item)).join('')}
            </div>`;
  }

  getHeaderCell({ id, title, sortable }) {
    const dataId = `data-id='${id}'`;
    const dataSortable = sortable ? 'data-sortable=true' : '';
    const dataOrder = sortable ? `data-order='${this.sorted.order}'` : '';

    return `<div class='sortable-table__cell' ${dataId} ${dataSortable} ${dataOrder}>
              <span>${title}</span>
              ${this.getSortingArrow(id)}
            </div>`;
  }

  getSortingArrow(id) {
    return this.sorted.id === id
      ? `<span data-element='arrow' class='sortable-table__sort-arrow'>
          <span class='sort-arrow'></span>
        </span>`
      : '';
  }

  getTableBody() {
    return `<div data-element='body' class='sortable-table__body'></div>`;
  }

  getTableRows(data) {
    return data
      .map(item => `<div class='sortable-table__row'>${this.getTableRow(item)}</div>`)
      .join('');
  }

  getTableRow(item) {
    return this.headerConfig
      .map(
        ({ id, template }) =>
          `<div class='sortable-table__cell'>${template ? template(item[id]) : item[id]}</div>`
      )
      .join('');
  }

  getLoading() {
    return `<div data-element='loading' class='loading-line sortable-table__loading-line'></div>`;
  }

  getEmptyPlaceholder() {
    return `<div data-element='emptyPlaceholder' class='sortable-table__empty-placeholder'><div>No data</div></div>`;
  }

  setEmptyPlaceholder(element) {
    const { emptyPlaceholder } = this.subElements;
    emptyPlaceholder.innerText = '';
    emptyPlaceholder.insertAdjacentElement('afterbegin', element);
  }

  async render() {
    super.render();
    this.data = !this.#isSortLocally && this.isEmpty ? await this.getServerData() : this.data;
    if (!this.isLoading) {
      this.data.length ? this.renderRows(this.data) : (this.isEmpty = true);
    }
    this.initEventListeners();
  }

  renderRows(data) {
    const { body } = this.subElements;
    data.length ? body.insertAdjacentHTML('beforeend', this.getTableRows(data)) : '';
  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();

    if (bottom < document.documentElement.clientHeight && !this.isLoading && !this.#isSortLocally) {
      const params = { ...this.sorted, start: this.data.length };
      const data = await this.getServerData(params);
      this.addRows(data);
    }
  };

  cleanRows() {
    this.subElements.body.innerText = '';
    this.isEmpty = false;
  }

  sortOnServer(id, order) {
    this.sorted = { id, order };
    this.serverUpdate();
  }

  async serverUpdate() {
    this.cleanRows();
    const data = await this.getServerData({ ...this.sorted, start: 0 });
    this.update(data);
  }

  addRows(data) {
    this.data = [...this.data, ...data];
    this.isLoading = false;
    data.length ? this.renderRows(this.data) : '';
  }

  update(data = []) {
    this.data = data;
    this.isLoading = false;
    if (!this.isEmpty) {
      this.cleanRows();
      this.renderRows(this.data);
    } else {
      this.isEmpty = true;
    }
  }

  setUrl(url) {
    this.url = url;
    this.#isSortLocally = false;
    this.serverUpdate();
  }

  async getServerData(params = this.sorted) {
    this.isLoading = true;
    const loadedData = await this.loadData(params);
    this.isLoading = false;
    this.#isSortLocally = loadedData.length < this.#limit;
    return loadedData;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', e => this.onSortClick(e));
    window.addEventListener('scroll', this.onWindowScroll);
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);
    this.update(sortedData);
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === id);
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
          throw new Error(`Unknown sort type ${sortType}`);
      }
    });
  }

  async loadData({ id, order, start = this.data.length } = {}) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', start + this.#limit);
    return fetchJson(this.url);
  }

  destroy() {
    super.destroy();
    this.element = null;
    this.subElements = null;
    window.removeEventListener('scroll', this.onWindowScroll);
  }
}
