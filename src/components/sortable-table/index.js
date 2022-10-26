import fetchJson from '../../utils/fetch-json.js';
import NotificationMessage from '../notification/index.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {
  element;
  sorted = { id: '', order: '' };
  subElements = {};
  isServerEmpty;
  isLoadingData = false;
  currentStep = 0;

  constructor(
    headerConfig = [],
    {
      data = [],
      url = '',
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      isSortLocally = false,
      step = 20,
      start = 0,
      end = start + step
    } = {}
  ) {
    this.headerConfig = [...headerConfig];
    this.data = [...data];
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
  }

  get templateTableHeader() {
    return this.headerConfig
      .map(
        item => `<div
          class="sortable-table__cell"
          data-id="${item.id}"
          data-sortable="${item.sortable}"
          data-order=""
        >
          <span>${item.title}</span>
          ${this.templateArrowTableHeader}
        </div>`
      )
      .join('');
  }

  get templateArrowTableHeader() {
    return `<span
      data-element="arrow"
      class="sortable-table__sort-arrow"
    >
      <span class="sort-arrow"></span>
    </span>`;
  }

  get templateTableBody() {
    return this.data
      .map(
        item => `<a
          href="/products/${item.id}"
          class="sortable-table__row"
        >
            ${this.getCellsTableBody(item)}
        </a>
        `
      )
      .join('');
  }

  getCellsTableBody(product) {
    return this.headerConfig
      .map(item =>
        item.template
          ? item.template(product[item.id])
          : `<div
            class="sortable-table__cell"
          >${product[item.id]}</div>`
      )
      .join('');
  }

  get templateHTML() {
    return `
      <div class="sortable-table">
        <div
          data-element="header"
          class="sortable-table__header
          sortable-table__row"
        >
        </div>
        <div
          data-element="body"
          class="sortable-table__body"
        >
        </div>
        <div
          data-element="loading"
          class="loading-line sortable-table__loading-line"
        >
        </div>
        <div
          data-element="emptyPlaceholder"
          class="sortable-table__empty-placeholder"
        >
          <div>
            <p>No products satisfies your filter criteria</p>
            <button
              type="button"
              class="button-primary-outline"
              data-element="emptyPlaceholderResetButton"
            >
              Reset all filters
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* FIXME: Исправить загрузку таблицы: полоска загрузки*/

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.templateHTML;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();

    await this.getDataFromServer(this.url);

    this.subElements.header.innerHTML = this.templateTableHeader;
    this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`).dataset.order =
      this.sorted.order;

    this.update();
  }

  async sort() {
    const { id, order } = this.sorted;
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      await this.sortOnServer(id, order);
    }
  }

  sortOnClient(id, order) {
    const directions = {
      asc: 1,
      desc: -1
    };
    const currentDirection = directions[order];
    const { sortType, customSorting } = this.headerConfig.find(item => item.id === id);

    this.subElements.header.querySelector(`[data-id="${id}"]`).dataset.order = order;

    this.data.sort((itemPrev, itemNext) => {
      switch (sortType) {
        case 'string':
          return (
            currentDirection *
            itemPrev[id].localeCompare(itemNext[id], ['ru', 'en'], {
              caseFirst: 'upper'
            })
          );
        case 'number':
          return currentDirection * (itemPrev[id] - itemNext[id]);
        case 'custom':
          return currentDirection * customSorting(itemPrev[id], itemNext[id]);
        default:
          return currentDirection * (itemPrev[id] - itemNext[id]);
      }
    });

    this.update();
  }

  async sortOnServer(id, order) {
    await this.getDataFromServer(this.url);

    this.update();

    this.subElements.header.querySelector(`[data-id="${id}"]`).dataset.order = order;
  }

  async getDataFromServer(url = this.url) {
    try {
      url.searchParams.set('_embed', 'subcategory.category');
      url.searchParams.set('_sort', this.sorted.id);
      url.searchParams.set('_order', this.sorted.order);
      url.searchParams.set('_start', this.start);
      url.searchParams.set('_end', this.end);

      this.isLoadingData = true;

      this.element.classList.add('sortable-table_loading');

      const data = await fetchJson(url);

      if (data.length < this.step) {
        this.isServerEmpty = true;
        this.isSortLocally = true;
      }

      this.data = this.start > 19 ? [...this.data, ...data] : data;

      this.start += this.step;
      this.end += this.step;

      this.element.classList.remove('sortable-table_loading');

      this.isLoadingData = false;
    } catch (error) {
      const notificaion = new NotificationMessage(error.message, { duration: 2000, type: 'error' });

      notificaion.show();

      throw new Error(error);
    }
  }

  getSubElements(parent = this.element) {
    const result = {};
    const elementsDOM = parent.querySelectorAll('[data-element]');

    for (const subElement of elementsDOM) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  async update() {
    const { body } = this.subElements;

    if (!this.data.length) {
      this.element.classList.add('sortable-table_empty');
      return;
    } else {
      this.element.classList.remove('sortable-table_empty');
    }

    body.innerHTML = this.templateTableBody;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.pointerDownSortHandler);
    document.addEventListener('scroll', this.scrollingDataLoading);

    this.subElements.emptyPlaceholderResetButton.addEventListener('pointerdown', () =>
      this.element.dispatchEvent(
        new Event('reset-filters', {
          bubbles: true
        })
      )
    );
  }

  removeEventListeners() {
    document.removeEventListener('pointerdown', this.pointerDownSortHandler);
    document.removeEventListener('scroll', this.scrollingDataLoading);
  }

  pointerDownSortHandler = event => {
    const currentTarget = event.target.closest('.sortable-table__cell[data-id]');

    if (currentTarget?.dataset.sortable === 'true') {
      this.start = 0;
      this.end = this.start + this.step;

      if (this.sorted.id !== currentTarget.dataset.id) {
        this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`).dataset.order = '';
        this.sorted.id = currentTarget.dataset.id;
      }

      this.sorted.order = currentTarget.dataset.order === 'desc' ? 'asc' : 'desc';
      this.sort();
    }
  };

  scrollingDataLoading = async event => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (
      !this.isSortLocally &&
      !this.isLoadingData &&
      !this.isServerEmpty &&
      clientHeight + scrollTop >= scrollHeight - 5
    ) {
      await this.sortOnServer(this.sorted.id, this.sorted.order);
    }
  };

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
    this.element = null;
    this.subElements = {};
    this.sorted.id = '';
    this.sorted.order = '';
    this.sorted = {};
  }
}
