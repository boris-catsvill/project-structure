import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  static isSortLocally = false;
  sortingData = []
  subElements = {}
  currentSortField
  start = 0
  end = 30
  sortShift = 30

  constructor(headersConfig, {
    url = new URL('/'),
    sorted = {},
    renderLinkItem = () => void (0),
  } = {}) {
    this.headerConfig = headersConfig;
    this.url = url;
    this.sortOrder = sorted.order || 'asc';
    this.sortID = sorted.id || 'title';
    this.renderLinkItem = renderLinkItem;
    this.render();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
      <div>
        <div data-element="header" class="sortable-table__header sortable-table__row"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>По вашим критериям поиска товаров не найдено</p>
              <button type="button" class="button-primary-outline">Сбросить фильтры</button>
            </div>
          </div>
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      </div>
`
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.renderHeader();
    this.sortOnServer();
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

  renderHeader(fieldValue = '', order = '') {
    if (this.subElements.header.firstElementChild) {
      const allHeaderCells = this.subElements.header.querySelectorAll('[data-order]');
      allHeaderCells.forEach((cell) => cell.dataset.order = '');
      const cellRerender = this.subElements.header.querySelector(`[data-id="${fieldValue}"]`);
      cellRerender.dataset.order = `${order}`;
      return;
    }
    for (const configPart of this.headerConfig) {
      this.subElements.header.insertAdjacentHTML('beforeend',this.renderHeaderCell(configPart))
    }
  }

  renderHeaderCell(configPart) {
    return `
      <div class="sortable-table__cell" data-id="${configPart.id}" data-sortable="${configPart.sortable}" data-order="">
        <span>${configPart.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
        </span>
      </div>
      `
  }

  renderBody() {
    this.subElements.body.innerHTML = '';
    for (const dataItem of this.sortingData) {
      this.subElements.body.insertAdjacentHTML('beforeend', this.renderLinkItem(dataItem))
    }
  }

  sortOnClick = (event) => {
    const target = event.target.closest('.sortable-table__cell');
    if (target.dataset.sortable === 'false') return;
    this.sortOrder === 'asc' ? this.sortOrder = 'desc' : this.sortOrder = 'asc';
    const sortableTable = document.querySelector('.sortable-table');
    sortableTable.classList.add('sortable-table_loading');
    this.currentSortField = target.dataset.id;
    this.sort(target.dataset.id, this.sortOrder);
  }

  scrollLoader = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight) {
      this.end += this.sortShift;
      this.sortOnServer({
        fieldValue: this.currentSortField,
        orderValue: this.sortOrder,
        start: this.start,
        end: this.end,
      });
    }
  }

  attachEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortOnClick);
    document.addEventListener('scroll', this.scrollLoader);
  }

  sort(fieldValue, orderValue) {
    SortableTable.isSortLocally
      ? this.sortOnClient(fieldValue, orderValue)
      : this.sortOnServer({ fieldValue, orderValue });
  }

  async sortOnServer({
    fieldValue = this.sortID,
    orderValue = this.sortOrder,
    start = this.start,
    end = this.end,
    updatedURL = null,
  } = {}) {
    if (updatedURL) this.url = updatedURL;
    this.url.searchParams.set('_sort', fieldValue);
    this.url.searchParams.set('_order', orderValue);
    this.url.searchParams.set('_start', `${start}`);
    this.url.searchParams.set('_end', `${end}`);
    this.sortingData = await fetchJson(this.url);
    const sortableTable = document.querySelector('.sortable-table');
    sortableTable.classList.remove('sortable-table_loading');
    if (!Object.entries(this.sortingData).length) {
      sortableTable.classList.add('sortable-table_empty');
      return;
    }
    this.start = start;
    this.end = end;
    this.renderHeader(fieldValue, orderValue);
    this.renderBody();
  }

  sortOnClient(fieldValue = this.sortID, orderValue = this.sortOrder) {
    const directions = {
      asc: 1,
      desc: -1
    }

    const direction = directions[orderValue];
    const column = this.headerConfig.find(item => item.id === fieldValue);
    const { sortType } = column;

    switch (sortType) {
      case 'string':
        this.sortingData.sort((a, b) => {
          return direction * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en'], { caseFirst: 'upper' })
        })
        break;
      case 'number':
        this.sortingData.sort((a, b) => {
          return direction * (a[fieldValue] - b[fieldValue])
        })
        break;
      default:
        break;
    }
    this.renderHeader(fieldValue, orderValue)
    this.renderBody();
  }

  removeListeners() {
    document.removeEventListener('scroll', this.scrollLoader);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeListeners();
    this.remove();
    this.subElements = {};
    this.sortingData = [];
    this.start = 0;
    this.end = 30;
  }
}
