import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subelements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', BACKEND_URL);


  async updateComponents (from, to) {
    const data = await this.loadData(from, to);

    this.element.querySelector('.sortable-table__body').innerHTML = '';
    this.components.sortableTable.update(data);

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }


  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    return data;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template();

    this.element = wrapper.firstElementChild;

    this.getRangePicker();
    this.getColumnChart();
    this.getSortableTable();

    this.subElements = this.getSubElements(this.element);

    return this.element;
  }

  getRangePicker() {
    const rangePickerContainer = this.element.querySelector('[data-element="rangePicker"]');
    const { from, to } = this.getDefaultRange();

    const rangePicker = new RangePicker({
      from: from,
      to: to
    });

    this.initEventListeners(rangePicker);

    rangePickerContainer.append(rangePicker.element);
  }

  getColumnChart() {
    const ordersContainer = this.element.querySelector('[data-element="ordersChart"]');
    const salesContainer = this.element.querySelector('[data-element="salesChart"]');
    const customersContainer = this.element.querySelector('[data-element="customersChart"]');

    const { from, to } = this.getDefaultRange();

    const formatHeading = value => `$${new Intl.NumberFormat('en-EN').format(value)}`;

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to,
      },
      label: 'orders',
      link: '#',
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'sales',
      formatHeading
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'customers',
    });

    ordersContainer.append(ordersChart.element);
    salesContainer.append(salesChart.element);
    customersContainer.append(customersChart.element);

    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;
  }

  getSortableTable() {
    const tableContainer = this.element.querySelector('[data-element="sortableTable"]');

    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true
    });

    sortableTable.onWindowScroll = null;
    tableContainer.append(sortableTable.element);

    this.components.sortableTable = sortableTable;
  }

  getDefaultRange() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    return { from, to };
  }

  template() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker">

        </div>
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
    </div>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners(rangePicker) {
    document.addEventListener('date-select', () => {
      const from = rangePicker.selected.from;
      const to = rangePicker.selected.to;

      this.updateComponents(from, to);
    });
  }

  destroy () {
    document.removeEventListener('date-select', this.element);

    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

}
