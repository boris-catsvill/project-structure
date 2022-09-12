import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements = {};
  data = [];
  loading = false;
  elementWithArrow;
  start = 0;
  end = 30;

  onClick = event => {
    const cell = event.target.closest('.sortable-table__cell');

    if (cell.dataset.sortable === 'true') {
      const { id } = cell.dataset;

      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      this.subElements.body.innerHTML = '';

      if (!cell.hasAttribute('data-order')) {
        this.elementWithArrow.removeAttribute('data-order');

        const arrow = this.elementWithArrow.querySelector("[data-element='arrow']");

        arrow.remove();

        this.elementWithArrow = cell;

        this.elementWithArrow.setAttribute('data-order', 'desc');

        this.elementWithArrow.innerHTML += `
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>`;

        this.sort(id, 'desc');
      } else {
        const presentOrder = cell.dataset.order;

        cell.setAttribute('data-order', orders[presentOrder]);

        this.sort(id, orders[presentOrder]);
      }
    }
  };

  onScroll = async () => {
    const { lastElementChild: lastChild } = this.subElements.body;
    const { bottom } = lastChild.getBoundingClientRect();
    const { clientHeight: screenHeight } = document.documentElement;

    if (bottom < screenHeight && !this.loading) {
      const { order, id } = this.elementWithArrow.dataset;
      const range = 30;

      this.start += range;
      this.end += range;

      this.loading = true;

      await this.sortOnServer(id, order);

      this.loading = false;
    }
  };

  constructor(headersConfig, { data = [], sorted = {}, url = '', isSortLocally = false } = {}) {
    this.data = data;
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);

    this.render();
  }

  async startSortPosition() {
    if (Object.entries(this.sorted).length === 0) {
      this.defaultSorting();
      return;
    }

    this.elementWithArrow = this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`);

    this.elementWithArrow.setAttribute('data-order', this.sorted.order);

    this.elementWithArrow.innerHTML += `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;

    this.bodyReFilling(this.data);
  }

  sort = (id = 'title', order = 'desc') => {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.start = 0;
      this.end = 30;
      this.data = [];

      this.sortOnServer(id, order);
    }
  };

  emptyData() {
    if (!this.subElements.emptyPlaceholder) {
      const div = document.createElement('div');

      div.innerHTML = `
    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
      </div>
    </div>`;

      const emptyPlaceholder = div.firstElementChild;
      this.subElements.emptyPlaceholder = emptyPlaceholder;

      this.element.classList.add('sortable-table_empty');

      this.element.append(emptyPlaceholder);
    }

    this.element.classList.add('sortable-table_empty');
  }

  async loadData(id = 'title', order = 'asc', start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    this.url.searchParams.set('_embed', 'subcategory.category');

    this.element.classList.add('sortable-table_loading');

    const response = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return response;
  }

  async defaultSorting() {
    this.elementWithArrow = this.subElements.header.querySelector(`[data-id="title"]`);

    this.elementWithArrow.setAttribute('data-order', 'asc');

    this.elementWithArrow.innerHTML += `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;

    this.bodyReFilling(this.data);
  }

  bodyReFilling(data) {
    if (data.length === 0) {
      this.emptyData();
    } else {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.bodyRowFill(data);
    }
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplateOfTable();

    this.element = element.firstElementChild;

    this.data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);

    this.makeHeader();
    this.loadingElement();
    this.makeBody();

    this.initEventListener();
  }

  initEventListener() {
    const { header } = this.subElements;

    header.addEventListener('pointerdown', this.onClick);
    document.addEventListener('scroll', this.onScroll);
  }

  getTemplateOfTable() {
    return `
      <div class="sortable-table"></div>
      `;
  }

  makeHeader() {
    const header = document.createElement('div');

    header.classList.add('sortable-table__header', 'sortable-table__row');

    header.setAttribute('data-element', 'header');

    header.innerHTML = this.headersConfig
      .map(item => {
        return `
        <div class="sortable-table__cell" ${
          item.sortType ? `data-sorttype=${item.sortType}` : ''
        } data-id="${item.id}" data-sortable="${item.sortable}">
              <span>${item.title}</span>
        </div>`;
      })
      .join('');

    this.subElements.header = header;

    this.element.append(header);
  }

  loadingElement() {
    const div = document.createElement('div');

    div.innerHTML = `
    <div
    data-element="loading"
    class="loading-line sortable-table__loading-line"></div>`;

    const loading = div.firstElementChild;

    this.subElements.loading = loading;

    this.element.append(loading);
  }

  makeBody() {
    const body = document.createElement('div');

    body.classList.add('sortable-table__body');

    body.setAttribute('data-element', 'body');

    this.subElements.body = body;

    this.startSortPosition();

    this.element.append(body);
  }

  bodyRowFill(data) {
    const [image] = this.headersConfig;
    const { id } = image;

    return data
      .map(item => {
        return id === 'images'
          ? `<a href="/products/${item.id}" class="sortable-table__row">${this.bodyCellFill(
              item
            )}</a>`
          : `<div class="sortable-table__row">${this.bodyCellFill(item)}</div>`;
      })
      .join('');
  }

  bodyCellFill(item) {
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

  checkType(id) {
    const element = this.subElements.header.querySelector(`[data-id="${id}"]`);

    return element.dataset.sorttype;
  }

  sortOnClient(whatSort, typeSort) {
    if (this.data.length === 0) {
      return;
    }

    const sortedArr = [...this.data];

    const type = this.checkType(whatSort);

    const sortMethods = {
      asc: 1,
      desc: -1
    };

    sortedArr.sort((a, b) => {
      if (type === 'string') {
        return (
          sortMethods[typeSort] *
          a[whatSort].localeCompare(b[whatSort], 'ru', {
            sensitivity: 'case',
            caseFirst: 'upper'
          })
        );
      }

      if (type === 'number') {
        return sortMethods[typeSort] * (a[whatSort] - b[whatSort]);
      }
    });

    this.subElements.body.innerHTML = this.bodyRowFill(sortedArr);
  }

  async sortOnServer(id, order) {
    const response = await this.loadData(id, order, this.start, this.end);

    if (response.length > 0) {
      this.data = [...this.data, ...response];

      this.bodyReFilling(this.data);
      this.subElements.loading.style.display = '';
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    document.removeEventListener('scroll', this.onScroll);
    this.header.removeEventListener('pointerdown', this.onClick);

    this.remove();
  }
}
