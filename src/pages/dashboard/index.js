import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements;

  range;
  rangePicker;

  orders;
  columnChartOrders;

  sales;
  columnChartSales;

  customers;
  columnChartCustomers;

  bestSellers;
  sortableTableBestSellers;

  constructor() {
    this.monthRangeDefault = 1;
    this.range = {
      to: new Date(),
      from: new Date(),
    };
    this.range.from.setMonth(this.range.from.getMonth() - this.monthRangeDefault);
    const rangePicker = new RangePicker(this.range);

    this.orders = {
      label: 'orders',
      link: '/sales',
      formatHeading: data => data,
      url: 'api/dashboard/orders',
      range: rangePicker.selected,
    };
    const ordersChart = new ColumnChart(this.orders);

    this.sales = {
      label: 'sales',
      formatHeading: data => {
        return '$' + data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      },
      url: 'api/dashboard/sales',
      range: rangePicker.selected,
    };
    const salesChart = new ColumnChart(this.sales);

    this.customers = {
      label: 'customers',
      formatHeading: data => data,
      url: 'api/dashboard/customers',
      range: rangePicker.selected,
    }
    const customersChart = new ColumnChart(this.customers);

    this.bestSellers = {
      url: `api/dashboard/bestsellers?from=${rangePicker.selected.from.toISOString()}&to=${rangePicker.selected.to.toISOString()}`,
      isSortLocally: true,
    };
    const sortableTable = new SortableTable(header, this.bestSellers);

    this.components = {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      rangePicker
    };
  }

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    Object.keys(this.components).forEach(componentName => {
      const subElement = this.subElements[componentName];
      const { element } = this.components[componentName];

      subElement.append(element);
    });

    this.initEventListener();

    return this.element;
  }

  getTemplate() {
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
          </div>
        `;
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

  initEventListener() {
    this.subElements.rangePicker.addEventListener('date-select', this.onDateSelect);
  }

  onDateSelect = async (event) => {
    this.components.ordersChart.update(event.detail.from, event.detail.to);
    this.components.salesChart.update(event.detail.from, event.detail.to);
    this.components.customersChart.update(event.detail.from, event.detail.to);

    this.components.sortableTable.url.searchParams.set('from', event.detail.from.toISOString());
    this.components.sortableTable.url.searchParams.set('to', event.detail.to.toISOString());
    const data = await this.components.sortableTable.loadData(this.components.sortableTable.sorted.id, this.components.sortableTable.sorted.order);
    this.components.sortableTable.update(data);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.components = {};
    this.subElements = {};
  }
}
