import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.to = new Date();

    this.from = new Date();
    this.from.setMonth(this.from.getMonth() - 1);

    this.url = new URL(`${BACKEND_URL}api/rest/orders`);
    this.url.searchParams.set('createdAt_gte', this.from.toISOString());
    this.url.searchParams.set('createdAt_lte', this.to.toISOString());
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.getSubElements();
    this.initComponents();
    this.appendComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    this.initRangePicker();
    this.initSortableTable();
  }

  async updateComponents() {
    this.url.searchParams.set('createdAt_gte', this.from.toISOString());
    this.url.searchParams.set('createdAt_lte', this.to.toISOString());

    this.components.sortableTable.updateData(this.url);
  }

  initRangePicker() {
    const rangePicker = new RangePicker({ from: this.from, to: this.to });
    this.components.rangePicker = rangePicker;
  }

  initSortableTable(url = this.url.href) {
    const sortableTable = new SortableTable(header, {
      url: url
    });

    this.components.sortableTable = sortableTable;
  }

  appendComponents() {
    Object.keys(this.components).forEach(componentName => {
      this.subElements[componentName].append(this.components[componentName].element);
    });
  }

  clearData = event => {
    this.to = new Date();
    this.from = new Date();
    this.from.setMonth(this.from.getMonth() - 1);

    this.updateComponents();
    this.components.rangePicker.setCustomRange(this.from, this.to);
  };

  dateSelectEvent = event => {
    this.from = event.detail.from;
    this.to = event.detail.to;
    this.updateComponents();
  };

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.dateSelectEvent);
    document.addEventListener('clear-data', this.clearData);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  }

  get template() {
    return `
      <div class="sales">
        <div class="content__top-panel">
          <h2 class="page-title">Sales</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Object.keys(this.components).forEach(componentName => this.components[componentName].destroy());
    document.removeEventListener('clear-data', this.clearData);
  }
}
