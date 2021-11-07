import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import Tooltip from '../../components/tooltip/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';
import comma from '../../utils/comma.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', BACKEND_URL);

  async updateComponents(from, to) {
    this.components.sortableTable.update(() => this.loadData(from, to));
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  loadData(from, to) {
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '19');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return fetchJson(this.url);
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({ from, to });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true,
      scrollLoad: false,
      rowTemplate: (data, item) =>
        `<a href="products/${item.id}" class="sortable-table__row">${data}</a>`
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: { from, to },
      label: 'orders',
      link: 'sales'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: { from, to },
      label: 'sales',
      formatHeading: value => `${comma(value)}$`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: { from, to },
      label: 'customers'
    });

    const tooltip = new Tooltip();
    tooltip.initialize();

    this.components = {
      rangePicker,
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      tooltip
    };
  }
  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      if (element) root.append(element);
    });
  }

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
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateComponents(from, to);
    });
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
