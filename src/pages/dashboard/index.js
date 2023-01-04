import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
/*
  async getDataForColumnCharts (from, to) {
    const ORDERS = `${process.env.BACKEND_URL}api/dashboard/orders?from=${from.toISOString()}&to=${to.toISOString()}`;
    const SALES = `${process.env.BACKEND_URL}api/dashboard/sales?from=${from.toISOString()}&to=${to.toISOString()}`;
    const CUSTOMERS = `${process.env.BACKEND_URL}api/dashboard/customers?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

    const ordersData = fetchJson(ORDERS);
    const salesData = fetchJson(SALES);
    const customersData = fetchJson(CUSTOMERS);

    const data = await Promise.all([ordersData, salesData, customersData]);
    return data.map(item => Object.values(item));
  }
*/
  async updateTableComponent (from, to) {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`);
    this.components.sortableTable.addRows(data);
  }

  async updateChartsComponents (from, to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
    
    /*
    const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);
    const ordersDataTotal = ordersData.reduce((accum, item) => accum + item);
    const salesDataTotal = salesData.reduce((accum, item) => accum + item);
    const customersDataTotal = customersData.reduce((accum, item) => accum + item);

    this.components.ordersChart.update({headerData: ordersDataTotal, bodyData: ordersData});
    this.components.salesChart.update({headerData: '$' + salesDataTotal, bodyData: salesData});
    this.components.customersChart.update({headerData: customersDataTotal, bodyData: customersData});
    */

  }

  async initComponents () {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));

    const rangePicker = new RangePicker({ from, to });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    });

    const ordersChart = new ColumnChart({
      url : 'api/dashboard/orders',
      range: { from, to },
      label: 'orders',
      link: '#'
    });

    const salesChart = new ColumnChart({
      url : 'api/dashboard/sales',
      range: { from, to },
      label: 'sales',
    });

    const customersChart = new ColumnChart({
      url : 'api/dashboard/customers',
      range: { from, to },
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
    this.subElements = this.getSubElements(this.element);

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

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateChartsComponents(from, to);
      this.updateTableComponent(from, to);
    });
  }
  
  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
/*
import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';

import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', BACKEND_URL);

  async updateComponents (from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  loadData (from, to) {
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '21');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return fetchJson(this.url);
  }

  initComponents () {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      },
      label: 'orders',
      link: '#'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'sales',
      range: {
        from,
        to
      }
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      label: 'customers',
      range: {
        from,
        to
      }
    });

    this.components = {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      rangePicker
    };
  }

  renderComponents () {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName]; // ordersChart
      const { element } = this.components[componentName];

      root.append(element);
    });
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

  render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements () {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.subElements = {};
    this.element = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
  }
}
*/