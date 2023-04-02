import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-config.js';
import fetchJson from '../../utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.initComponents();
    this.renderComponents();
    this.initEventListeners();
    return this.element;
  }
  getTemplate() {
    return `
      <div class="sales full-height flex-column">
      <div class="content__top-panel">
      <h1 class="page-title">Продажи</h1>
      <div data-element="rangePicker"></div>
      </div>
      <div data-element="sortableTable" class="full-height flex-column"></div>
      </div>
    `;
  }
  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, elem) => {
      acc[elem.dataset.element] = elem;
      return acc;
    }, {});
  }
  initComponents() {
    const to = (this.to = new Date());
    const from = (this.from = new Date(to.getFullYear(), to.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${this.from.toISOString()}&createdAt_lte=${this.to.toISOString()}`,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      },
      isSortLocally: false
    });

    this.components = {
      rangePicker,
      sortableTable
    };
  }
  renderComponents() {
    Object.entries(this.components).forEach(([key, value]) => {
      this.subElements[key].append(value.element);
    });
  }
  async updateSales(from, to) {
    const response = await this.loadData(from, to);
    this.components.sortableTable.update(response);
  }

  loadData(from, to) {
    const {
      start,
      end,
      sorted: { id, order }
    } = this.components.sortableTable;
    const url = new URL('api/rest/orders', BACKEND_URL);
    url.searchParams.set('createdAt_gte', from.toISOString());
    url.searchParams.set('createdAt_lte', to.toISOString());
    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);
    return fetchJson(url);
  }

  initEventListeners() {
    const { rangePicker } = this.components;
    rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateSales(from, to);
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.subElements = null;
    this.element = null;
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
