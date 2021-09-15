import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import Helpers from '../../utils/helpers.js';
import header from './bestsellers-header.js';

export default class Page {
  element = null;
  subElements = {};

  constructor() {
    this.range = {
      from: new Date(),
      to: new Date(),
    };
    this.range.from = Helpers.setUTCMonthCorrectly(this.range.from, this.range.from.getUTCMonth() - 1);
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const rangePicker = new RangePicker(this.range);

    const ordersChart = new ColumnChart({
      range: this.range,
      url: 'api/dashboard/orders',
      label: 'Orders',
      link: '/sales'
    });

    const salesChart = new ColumnChart({
      range: this.range,
      url: 'api/dashboard/sales',
      label: 'Sales',
      formatHeading: data => `$${data.toLocaleString('en-US')}`
    });

    const customersChart = new ColumnChart({
      range: this.range,
      url: 'api/dashboard/customers',
      label: 'Customers'
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`,
      isSortLocally: true
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  renderComponents() {
    Object.keys(this.subElements).forEach(key => {
      this.subElements[key].append(this.components[key].element);
    });
  }

  get template() {
    return `
        <div class="dashboard full-height flex-column">

            <div class="content__top-panel">
              <h2 class="page-title">Dashboard</h2>
              <!-- RangePicker -->
              <div data-element="rangePicker"></div>
            </div>

            <div class="dashboard__charts">
              <!-- ColumnCharts -->
              <div data-element="ordersChart" class="dashboard__chart_orders"></div>
              <div data-element="salesChart" class="dashboard__chart_sales"></div>
              <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>

            <h3 class="block-title">Best sellers</h3>

            <!-- SortableTable -->
            <div data-element="sortableTable" class="full-height flex-column"></div>
        </div>`;
  }

  async updateComponents(range) {
    const {from, to} = range;
    const fromISO = from.toISOString();
    const toISO = to.toISOString();

    const url = `api/dashboard/bestsellers?_start=0&_end=30&from=${fromISO}&to=${toISO}&_sort=title&_order=asc`;

    this.components.sortableTable.update(url);

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  initEventListeners() {
    this.element.addEventListener('date-select', event => {
      this.range = event.detail;

      this.updateComponents(this.range);
    });
  }

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');

    return [...subElements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
