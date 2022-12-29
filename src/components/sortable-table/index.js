import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {},
    url = '',
    isSortLocally = false,
    isDrilldown = true,
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.loadRange = 10;
    this.params = {
      start: 0,
      end: this.loadRange,
    }
    this.isLoading = false;
    this.scrollBorderY = 300;
    this.isDrilldown = isDrilldown;

    this.render();
  }

  getTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getColumnHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
          </div>
        </div>
      </div>
    `
  }

  getColumnHeader() {
    return this.headerConfig
      .map(item => {
        const sortSpan = item.sortable ?
          `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>` :
          '';

        return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
          <span>${item.title}</span>
          ${sortSpan}
        </div>`;
      })
      .join("");
  }

  getColumnBody() {
    return this.data
      .map(item => {
        return `${this.isDrilldown ? `<a href="/products/${item.id}"` : `<div`}
          class="sortable-table__row">
          ${this.headerConfig
            .map(column => {
              let value = item[column.id];
              if (column.sub_id) { value = value[column.sub_id]; }
              if (column.formatData) { value = column.formatData(value); }
              if (column.template) {
                return column.template(value);
              } else {
                return `<div class="sortable-table__cell">${value}</div>`;
              }
            })
            .join("")
          }${this.isDrilldown ? `</a>` : `</div>`}`
      })
      .join("");
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initEventListener();

    if (this.sorted.id) {
      await this.sort(this.sorted.id, this.sorted.order);
    } else {
      await this.loadData();
    }
  }

  renderData() {
    this.subElements.body.innerHTML = this.getColumnBody();
  }

  initEventListener() {
    window.addEventListener('scroll', async (event) => {
      await this.populate();
    });

    this.subElements.header.addEventListener('pointerdown', (event) => {
      const div = event.target.closest('div');
      if (!div) return;
      const field = div.dataset.id;
      const orderValue = div.dataset.order === 'desc' ? 'asc' : 'desc';
      this.sort(field, orderValue);
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  async sort(field, direction = 'asc') {
    if (this.isSortLocally) {
      this.sortOnClient(field, direction);
    } else {
      await this.sortOnServer(field, direction);
    }

    this.subElements.header.querySelectorAll('[data-order]').forEach(element => {
      element.removeAttribute('data-order');
    });
    this.subElements.header.querySelector('[data-id="' + field + '"]').setAttribute('data-order', direction);
  }

  sortOnClient(id, order = 'asc') {
    let funcCompare;

    if (this.headerConfig.find(obj => obj.id === id).sortable === false) return;
    const sortType = this.headerConfig.find(obj => obj.id === id).sortType;
    const customSorting = this.headerConfig.find(obj => obj.id === id).customSorting;

    switch (sortType) {
      case 'number':
        funcCompare = compareNumber;
        break;
      case 'string':
        funcCompare = localeCompareRuEnUpperFirst;
        break;
      case 'custom':
        funcCompare = customSorting;
        break;
      default:
        throw new Error(`There is not this sort type ${sortType}`);
    }

    this.data.sort((a, b) => {
      if (order === 'asc') {
        return funcCompare(a[id], b[id]);
      } else if (order === 'desc') {
        return funcCompare(b[id], a[id]);
      } else {
        throw 'There is not this sort order.';
      }
    });

    this.renderData();

    function localeCompareRuEnUpperFirst(a, b) {
      return a.localeCompare(b, ['ru', 'en'], { caseFirst: "upper" });
    }

    function compareNumber(a, b) {
      return a - b;
    }
  }

  async sortOnServer(id, order) {
    this.params.id = id;
    this.params.order = order;
    if (id) this.url.searchParams.set('_sort', id);
    if (order) this.url.searchParams.set('_order', order);
    this.params.start = 0;
    this.params.end = this.loadRange;

    await this.loadData();

    return this.data;
  }

  loadData() {
    this.url.searchParams.set('_start', this.params.start);
    this.url.searchParams.set('_end', this.params.end);

    return fetchJson(this.url)
      .then(data => {
        this.data = data;
        this.renderData();
      })
      .catch(error => console.error('Something went wrong: ' + error));
  }

  async populate() {
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
    if (
      windowRelativeBottom < document.documentElement.clientHeight + this.scrollBorderY &&
      !this.isLoading &&
      !this.isSortLocally
    ) {
      this.isLoading = true;
      this.params.start += this.loadRange;
      this.params.end += this.loadRange;
      this.url.searchParams.set('_start', this.params.start);
      this.url.searchParams.set('_end', this.params.end);
      if (this.params.id) this.url.searchParams.set('_sort', this.params.id);
      if (this.params.order) this.url.searchParams.set('_order', this.params.order);

      try {
        const data = await fetchJson(this.url);
        this.data = [...this.data, ...data];
        this.renderData();
        this.isLoading = false;
      } catch (error) {
        console.error('Something went wrong: ' + error);
      }
    }
  }
}