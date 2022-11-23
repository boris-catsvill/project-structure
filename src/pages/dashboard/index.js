import RangePicker from '../../components/range-picker/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';
import LinkedSortableTable from '../../components/sortable-table/linked';
import { getSubElements } from '../../utils/helpers';

export default class Page {
  element;
  subElements = {};
  components = {};
  section = 'dashboard'

  async updateTableComponent (from, to) {
    this.components.sortableTable.range = { from: from.toISOString(), to: to.toISOString() } //= await fetchJson(`${process.env.BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`);
    const data = await this.components.sortableTable.loadData()
    this.components.sortableTable.addRows(data);
  }

  async updateChartsComponents(from, to) {
    await this.components.ordersChart.update(from, to);
    await this.components.salesChart.update(from, to);
    await this.components.customersChart.update(from, to);
  }

  async initComponents () {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));

    const rangePicker = new RangePicker({from, to});

    let range = {from: from.toISOString(), to: to.toISOString()}

    const sortableTable = new LinkedSortableTable(header, {
      url: `api/dashboard/bestsellers`,
      isSortLocally: true, start: 1, step: 30, range: range, scroll: false
    });

    const ordersChart = new ColumnChart({
      range: range,
      url: `api/dashboard/orders`,
      label: 'orders',
      link: '#'
    });

    const salesChart = new ColumnChart({
      range: range,
      url: `api/dashboard/sales`,
      label: 'sales',
      formatHeading: data => `$${data}`,
    });

    const customersChart = new ColumnChart({
      url: `api/dashboard/customers`,
      range: range,
      label: 'customers',
    });

    this.components.sortableTable = sortableTable;
    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;
    this.components.rangePicker = rangePicker;
  }

  get template () {
    return `<div class="dashboard">
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

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateChartsComponents(from, to);
      this.updateTableComponent(from, to);
    });
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
