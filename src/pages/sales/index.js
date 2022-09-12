import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Sales {
  subElements = {};
  components = {};
  range = {
    from: new Date(),
    to: new Date()
  };

  onDateSelectFunction = event => {
    const { from, to } = event.detail;

    this.salesTableReFill(from, to);
  };

  constructor() {
    this.getDatesForRange();
    this.render();
  }

  makeURL(from = this.range.from, to = this.range.to) {
    const url = new URL(`/api/rest/orders`, BACKEND_URL);

    url.searchParams.set('createdAt_gte', from.toISOString());
    url.searchParams.set('createdAt_lte', to.toISOString());

    return url.pathname + url.search;
  }

  getDatesForRange() {
    this.range.from = new Date();
    this.range.to = new Date();

    this.range.from.setMonth(this.range.from.getMonth() - 1);
  }

  getTemplate() {
    const div = document.createElement('div');

    div.innerHTML = `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Sales</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
    </div>
      <div data-element="sortableTable">
          <!-- sortable-table component -->
      </div>
    </div>`;

    this.element = div.firstElementChild;

    this.getSubElements();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const elem of elements) {
      this.subElements[elem.dataset.element] = elem;
    }
  }

  makeRangePicker() {
    const rangePicker = new RangePicker(this.range);

    this.components.rangePicker = rangePicker;
    this.subElements.rangePicker.append(rangePicker.element);
  }

  makeSortTable() {
    const sorted = {
      id: 'createdAt',
      order: 'desc'
    };

    const url = this.makeURL();

    const saleTable = new SortableTable(header, { sorted, url });

    this.components.saleTable = saleTable;
    this.subElements.sortableTable.append(saleTable.element);
  }

  async salesTableReFill(from, to) {
    try {
      const { url } = this.components.saleTable;

      url.searchParams.set('createdAt_gte', from.toISOString());
      url.searchParams.set('createdAt_lte', to.toISOString());

      this.components.saleTable.url = url;

      console.log(this.components.saleTable);

      const data = await this.components.saleTable.loadData();

      this.components.saleTable.bodyReFilling(data);
    } catch (error) {
      console.log(error);
    }
  }

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelectFunction);
  }

  render() {
    this.getTemplate();

    this.makeRangePicker();
    this.makeSortTable();
    this.initEventListeners();

    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element.removeEventListener('date-select', this.onDateSelectFunction);

    for (const component in this.components) {
      this.components[component].destroy();
    }

    this.element = null;
    this.subElements = null;
    this.components = null;
    this.range = null;
  }
}
