import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    await this.createComponents();
    this.initComponents();
    this.initEventListeners();
    return this.element;
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }
    return subElements;
  }

  getTemplate() {
    return `
    <div class="dashboard full-height flex-column">
      <div class="content__top-panel">
        <h2 class="page-title">Панель управления</h2>
        
        <div data-element="rangePicker">
        
        </div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders">
        </div>
        <div data-element="salesChart" class="dashboard__chart_sales">
        </div>
        <div data-element="customersChart" class="dashboard__chart_customers">
        </div>
      </div>

      <h3 class="block-title">Лидеры продаж</h3>

      <div class="dashboard__sortable" data-element="sortableTable">
      </div>
    </div>
    `;
  }

  async createComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);
    const picker = new RangePicker({
      from,
      to
    });

    this.components.rangePicker = picker;

    const orders = new ColumnChart({
      data: ordersData,
      label: 'Заказы',
      link: '#'
    });

    this.components.ordersChart = orders;

    const sales = new ColumnChart({
      data: salesData,
      label: 'Продажи',
      formatHeading: data => `$${data}`
    });

    this.components.salesChart = sales;

    const customers = new ColumnChart({
      data: customersData,
      label: 'Посетители'
    });

    this.components.customersChart = customers;

    const sortableUrl = new URL('api/dashboard/bestsellers', process.env.BACKEND_URL);
    sortableUrl.searchParams.set('to', to.toISOString());
    sortableUrl.searchParams.set('from', from.toISOString());

    const sortable = new SortableTable(header, {
      url: sortableUrl,
      isSortLocally: true
    });
    this.sortableUrl = new URL(sortable.url);

    this.components.sortableTable = sortable;
  }

  initComponents() {
    Object.entries(this.components).forEach(([key, value]) => {
      if (this.subElements[key]) {
        this.subElements[key].append(value.element);
      }
    });
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.update(from, to);
    });
  }

  async update(from, to) {
    const data = await this.fetchData(from, to);
    const { sortableTable, ordersChart, salesChart, customersChart } = this.components;
    const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);

    ordersChart.update(ordersData);
    salesChart.update(salesData);
    customersChart.update(customersData);
    if (data.length) {
      sortableTable.element.classList.remove('sortable-table_empty');
      sortableTable.update(data);
      return;
    }
    sortableTable.element.classList.add('sortable-table_empty');
  }

  async getDataForColumnCharts(from, to) {
    const ORDERS = `${
      process.env.BACKEND_URL
    }api/dashboard/orders?from=${from.toISOString()}&to=${to.toISOString()}`;
    const SALES = `${
      process.env.BACKEND_URL
    }api/dashboard/sales?from=${from.toISOString()}&to=${to.toISOString()}`;
    const CUSTOMERS = `${process.env.BACKEND_URL}api/dashboard/customers?from=${encodeURIComponent(
      from.toISOString()
    )}&to=${encodeURIComponent(to.toISOString())}`;

    const ordersData = fetchJson(ORDERS);
    const salesData = fetchJson(SALES);
    const customersData = fetchJson(CUSTOMERS);

    const data = await Promise.all([ordersData, salesData, customersData]);
    return data;
  }

  fetchData(from, to) {
    this.sortableUrl.searchParams.set('to', to.toISOString());
    this.sortableUrl.searchParams.set('from', from.toISOString());

    return fetchJson(this.sortableUrl);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
    this.sortableUrl = null;
    Object.values(this.components).forEach(item => item.destroy());
    this.components = {};
  }
}
