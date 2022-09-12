import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  element;
  subElements;
  components;

  onRangeSelected = (event) => {
    const { from, to } = event.detail;
    this.updateComponents(from.toISOString(), to.toISOString());
  }

  constructor() {}

  get template() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  getRange() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const toISO = to.toISOString();
    const fromISO = from.toISOString();

    return { from, to, fromISO, toISO };
  }

  createComponents() {
    const {from, to, fromISO, toISO} = this.getRange();

    const rangePicker = new RangePicker({
      from,
      to
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from: fromISO,
        to: toISO
      },
      label: 'orders',
      link: '/sales'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from: fromISO,
        to: toISO
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from: fromISO,
        to: toISO
      },
      label: 'customers',
    });

    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true,
      isRowsClickable : true,
      urlSettings: {from: fromISO, to: toISO}
    });
    this.components = {rangePicker, ordersChart, salesChart, customersChart, sortableTable};
  }

  addComponents() {
    Object.entries(this.components).map(([componentName, component]) => {
        this.subElements[componentName].append(component.element);
    });
  }

  updateComponents(from, to) {
    Object.values(this.components).map(component => {
      if(component !== this.components.rangePicker) component.update({from: from, to: to});
    });
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
    this.createComponents();
    this.initEventListeners();
    this.addComponents();

    return this.element;
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.onRangeSelected);
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

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.components.rangePicker.element.removeEventListener('date-select', this.onRangeSelected);
    Object.values(this.components).map(component => component.destroy());
    this.remove();
  }
}