import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/rest/orders', BACKEND_URL);

  async updateComponents(from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);
  }

  loadData(from, to) {
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('createdAt_gte', from.toISOString());
    this.url.searchParams.set('createdAt_lte', to.toISOString());
    this.components.sortableTable.data = [];
    return fetchJson(this.url);
  }

  initComponents() {
    const now = new Date();
    const range = {
      from: new Date(now.setMonth(now.getMonth() - 1)),
      to: new Date()
    };
    const rangePicker = new RangePicker(range);

    const sortableTable = new SortableTable(header,{
      url: `${BACKEND_URL}api/rest/orders?_start=0&_end=30&createdAt_gte=${range.from.toISOString()}&createdAt_lte=${range.to.toISOString()}`,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    });
    this.components = {
      rangePicker,
      sortableTable
    };
  }

  get template() {
    return `<div class="sales">
      <div class="content__top-panel">
        <h2 class="page-title">Продажи</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <!-- sortable-table component -->
      <div data-element="sortableTable">
      </div>
    </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.getSubElements(element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }
  renderComponents() {
    for (const component of Object.keys(this.components)) {
      this.subElements[component].append(this.components[component].element);
    }
  }
  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateComponents(from, to);
    });
  }
  getSubElements(element) {
    const arr = element.querySelectorAll('[data-element]');
    for (const elem of arr) {
      this.subElements[elem.dataset.element] = elem;
    }
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.subElements = {};
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
  }
}
