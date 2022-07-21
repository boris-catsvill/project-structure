import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
  element;
  subElements = {};
  pageComponents = {};
  url = new URL('/api/dashboard/bestsellers', BACKEND_URL);

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderPageComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
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
      range: {
        from,
        to
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'customers'
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_sort=title&_order=asc&_start=${from.toISOString()}&_end=${to.toISOString()}`,
      isSortLocally: true
    });

    this.pageComponents.rangePicker = rangePicker;
    this.pageComponents.ordersChart = ordersChart;
    this.pageComponents.salesChart = salesChart;
    this.pageComponents.customersChart = customersChart;
    this.pageComponents.sortableTable = sortableTable;
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
        `;
  }

  renderPageComponents() {
    Object.keys(this.pageComponents).forEach(pageComponent => {
      const pagePlace = this.subElements[pageComponent];

      pagePlace.append(this.pageComponents[pageComponent]['element']);
    });
  }

  async updateComponent(from, to) {
    const data = await this.loadData(from, to);

    this.pageComponents.ordersChart.update(from, to);
    this.pageComponents.salesChart.update(from, to);
    this.pageComponents.customersChart.update(from, to);
    this.pageComponents.sortableTable.update(data);
  }

  loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');

    return fetchJson(this.url);
  }

  initEventListeners() {
    this.pageComponents.rangePicker.element.addEventListener('date-select', async event => {
      const { from, to } = event.detail;
      await this.updateComponent(from, to);
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

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
    this.element = null;
    this.subElements = {};

    for (const component of Object.values(this.component)) {
      component.destroy();
    }

    this.component = {};
  }
}
