import fetchJson from '../../utils/fetch-json.js';
import vars from '../../utils/vars.js';

import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';

import header from './bestsellers-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL(vars.API_BESTSELLERS, vars.BACKEND_URL);

  async updateComponents(from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  loadData(from, to) {
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '21');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return fetchJson(this.url);
  }

  getTemplate() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>

          <!-- range-picker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <!-- column-chart component -->
          <div class="dashboard__chart_orders" data-element="ordersChart"></div>
          <div class="dashboard__chart_sales" data-element="salesChart"></div>
          <div class="dashboard__chart_customers" data-element="customersChart"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <!-- sortable-table component -->
        <div data-element="sortableTable"></div>
      </div>
      `;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({from, to});

    const sortableTable = new SortableTable(header,
        {url: `${vars.API_BESTSELLERS}?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
        isSortLocally: true});

    const ordersChart = new ColumnChart({
      url: vars.API_ORDERS,
      range: {from, to},
      label: 'orders',
      link: '#'
    });

    const salesChart = new ColumnChart({
      url: vars.API_SALES,
      range: {from, to},
      label: 'sales',
    });

    const customersChart = new ColumnChart({
      url: vars.API_CUSTOMERS,
      range: {from, to},
      label: 'customers',
    });

    this.components = {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      rangePicker
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    });
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
  }
}
