import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';

import {salesTableHeader} from '../../constants';

export default class Page {
  element;
  subElements = {};
  components = {};

  initComponents() {
    const rangePicker = new RangePicker(this.currentRange);
    const sortableTable = new SortableTable(salesTableHeader, {start: 0, step: 30, url: this.tableUrl})
    this.components.rangePicker = rangePicker;
    this.components.sortableTable = sortableTable;
  }

  initEventListeners() {
    const { rangePicker } = this.components;
    rangePicker.element.addEventListener('date-select', (event) => {
      const { from, to } = event.detail;
      this.updateTable(from, to)
    })
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  async render() {
    this.element = document.createElement('div');
    this.element.className = 'sales full-height flex-column';
    this.element.dataset.role = 'sales';
    this.element.innerHTML = `
      <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="sortableTable"></div>
    `;

    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element
  }

  async updateTable(from, to) {
    const { sortableTable } = this.components;
    sortableTable.url.searchParams.set('createdAt_gte', from.toISOString());
    sortableTable.url.searchParams.set('createdAt_lte', to.toISOString());
    const newData = await sortableTable.loadData();
    sortableTable.addRows(newData);
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  get currentRange() {
    const to = new Date();
    const from = new Date(to);
    from.setMonth(to.getMonth() - 1);

    return { from, to };
  }

  get tableUrl() {
    const { from, to } = this.currentRange;
    const url = new URL("api/rest/orders", process.env.BACKEND_URL);
    url.searchParams.append("createdAt_gte", from.toISOString());
    url.searchParams.append("createdAt_lte", to.toISOString());
    url.searchParams.append("_start", "0");
    url.searchParams.append("_end", "30");

    return url;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.components.rangePicker.destroy();
    this.components.sortableTable.destroy();
    this.components = {};
    this.subElements = {};
  }
}
