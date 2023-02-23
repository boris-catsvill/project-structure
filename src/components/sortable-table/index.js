import fetchJson from '../../utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element = null;
  subElements = [];

  LOAD_COUNT = 30;
  SCROLL_START_LOAD_SHIFT = 100;
  isScrolled = false;
  isLoading = false;
  controller = new AbortController();

  orderSwitch = {
    asc: 'desc',
    desc: 'asc',
    undefined: 'asc'
  };

  constructor(
    headerConfig = [],
    {
      url = '',
      range = { to: new Date(), from: new Date() },
      isSortLocally = !Boolean(url),
      data = [],
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      namesForApiRange = {
        from: 'from',
        to: 'to'
      },
      linkRow = { hrefTemplate: item => `/product/${item}`, field: 'id' }
    }
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = url;
    this.range = range;
    this.namesForApiRange = namesForApiRange;
    this.linkRow = linkRow;

    this.render();
  }

  async render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;

    this.getSubElements();
    this.addEvents();

    await this.loadData();
  }

  getSubElements() {
    for (const item of this.element.querySelectorAll('div[data-element]')) {
      this.subElements[item.dataset.element] = item;
    }
  }

  addEvents() {
    this.addSortEvent();
    this.addScrollEvent();
  }

  sortCallback = event => {
    const target = event.target.closest('[data-sortable=true]');

    this.isScrolled = false;
    if (!this.isSortLocally) {
      this.data = [];
    }

    if (target) {
      this.sorted = {
        id: target.dataset.id,
        order: this.orderSwitch[this.sorted.order]
      };
      this.sort();
    }
  };

  addSortEvent() {
    this.subElements.header.addEventListener('pointerdown', this.sortCallback, {
      signal: this.controller.signal
    });
  }

  scrollCallback = async () => {
    const { bottom } = document.documentElement.getBoundingClientRect();
    if (
      !this.isLoading &&
      !this.isSortLocally &&
      bottom - window.innerHeight < this.SCROLL_START_LOAD_SHIFT
    ) {
      this.isScrolled = true;
      this.isLoading = true;
      await this.loadData();
    }
  };

  addScrollEvent() {
    window.addEventListener('scroll', this.scrollCallback, {
      signal: this.controller.signal
    });
  }

  sort(id = this.sorted.id, order = this.sorted.order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  async loadData(range = this.range) {
    this.showLoading();

    const query = new URL(this.url, BACKEND_URL);
    query.searchParams.set('_sort', this.sorted.id);
    query.searchParams.set('_order', this.sorted.order);
    query.searchParams.set('_embed', 'subcategory.category');
    query.searchParams.set('_start', this.data.length);
    query.searchParams.set('_end', Number(this.data.length + this.LOAD_COUNT));
    if (range.from) {
      query.searchParams.set(this.namesForApiRange.from, range.from.toISOString());
    }
    if (range.to) {
      query.searchParams.set(this.namesForApiRange.to, range.to.toISOString());
    }

    let data = [];
    try {
      data = await fetchJson(query);
      if (data) {
        if (!this.isScrolled) {
          this.data = [];
        }
        this.data.push(...data);
        this.updateData();
        return data;
      }
    } catch (error) {
      throw `Error of data loading. ${error.message}`;
    }
  }

  async sortOnServer(id = this.sorted.id, order = this.sorted.order) {
    this.sorted.order = order;
    this.sorted.id = id;

    if (id && this.url) {
      return await this.loadData();
    }
  }

  sortOnClient(id = this.sorted.id, order = this.sorted.order) {
    let sortFns;
    const switchSortType = this.headerConfig.filter(item => item.id === id)[0].sortType;

    switch (switchSortType) {
      case 'string':
        sortFns = (a, b) => {
          return order === 'asc'
            ? a[id].localeCompare(b[id].toUpperCase(), ['ru', 'en'])
            : b[id].localeCompare(a[id].toUpperCase(), ['ru', 'en']);
        };
        break;
      case 'number':
        sortFns = (a, b) => {
          return order === 'asc' ? a[id] - b[id] : b[id] - a[id];
        };
        break;
      default:
        throw new Error('Sort order error.');
    }
    this.data.sort(sortFns);

    this.updateData();
  }

  getTemplate() {
    return `<div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.getHeaderTemplate()}
          ${this.getBodyTemplate()}
          ${this.getLoadingTemplate()}
          ${this.getPlaceholderTemplate()}
        </div>
      </div>`;
  }

  getHeaderTemplate() {
    return this.isConfigNotEmpty()
      ? `<div
        data-element="header"
        class="sortable-table__header sortable-table__row"
      >
        ${this.getHeaderInnerTemplate()}
      </div>`
      : '';
  }

  getHeaderInnerTemplate() {
    return this.isConfigNotEmpty()
      ? this.headerConfig.map(item => this.getHeaderCellTemplate(item)).join('')
      : '';
  }

  getHeaderCellTemplate(cell) {
    return `<div
    class="sortable-table__cell"
    data-id="${cell.id}"
    data-sortable="${cell.sortable}"
    data-order="${this.sorted.id === cell.id ? this.sorted.order : ''}"
  >
    <span>${cell.title}</span>
    ${this.getSortArrowTemplate(cell.id)}
  </div>`;
  }

  getBodyTemplate() {
    return `<div data-element="body" class="sortable-table__body">
      ${this.getBodyInnerTemplate()}
    </div>`;
  }
  getBodyInnerTemplate() {
    return this.isDataLoaded() ? this.data.map(item => this.getBodyRowTemplate(item)).join('') : '';
  }

  getBodyRowTemplate(row = {}) {
    if (this.isConfigNotEmpty() && row) {
      const content = this.headerConfig
        .map(headerColumn => {
          return headerColumn.template
            ? `<div class="sortable-table__cell">${headerColumn.template(
                row[headerColumn.id]
              )}</div>`
            : `<div class="sortable-table__cell">${row[headerColumn.id] || ''}</div>`;
        })
        .join('');

      if (this.linkRow) {
        return `<a href="${this.linkRow.hrefTemplate(
          row[this.linkRow.field]
        )}" class="sortable-table__row">${content}</a>`;
      } else {
        return `<div class="sortable-table__row">${content}</div>`;
      }
    }
    return '';
  }

  getLoadingTemplate() {
    return `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`;
  }

  getPlaceholderTemplate() {
    return `<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
    <div>
      <p>No products satisfies your filter criteria</p>
      <button type="button" class="button-primary-outline">Reset all filters</button>
    </div>
    </div>`;
  }

  getSortArrowTemplate(id) {
    return id === this.sorted.id
      ? `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`
      : '';
  }

  updateData() {
    this.hideLoading();
    if (this.isDataLoaded()) {
      this.hidePlaceholder();
      this.subElements.body.innerHTML = this.getBodyInnerTemplate();
      this.subElements.header.innerHTML = this.getHeaderInnerTemplate();
    } else {
      this.showPlaceholder();
    }
  }

  isConfigNotEmpty() {
    return this.headerConfig && this.headerConfig.length > 0;
  }

  isDataLoaded() {
    if (this.data && this.data.length > 0) {
      return this.data;
    }
    return false;
  }

  showPlaceholder() {
    this.subElements.emptyPlaceholder.classList.remove('sortable-table__empty-placeholder');
  }

  hidePlaceholder() {
    this.subElements.emptyPlaceholder.classList.add('sortable-table__empty-placeholder');
  }

  showLoading() {
    this.isLoading = true;
    // this.subElements.loading.classList.add("");
    // what class?
  }

  hideLoading() {
    this.isLoading = false;
    // this.subElements.loading.classList.remove("");
    // what class?
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.controller.abort();
    this.remove();
    this.element = null;
  }
}
