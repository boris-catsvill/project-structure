import RangePicker from '../../components/range-picker/index';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from '../bestsellers-header';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  element;
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', BACKEND_URL);

  async updateComponents (from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.updateTable(data);
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


  constructor() {
    this.render();
  }

  getTemplate() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
      </div>
    </div>`;
  }

  initComponents() {
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

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to)
        .catch((error) => console.error(error));
    });
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
