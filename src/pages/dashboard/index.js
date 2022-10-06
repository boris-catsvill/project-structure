import RangePicker from './components/range-picker/src/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';
import select from '../../utils/select.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', BACKEND_URL);

  initCompinents () {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
  
    const sortableTable = new SortableTable(header, {
      url: this.url,
      isSortLocally: true
    });

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
      label: 'customers',
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  getTeamplate () {
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
        <div data-element="sortableTable"></div>
      </div>
    `
  }

  initUrl (from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '20');

    return fetchJson(this.url);
  }

  async updateComponents (from, to) {
    const data = await this.initUrl(from, to);

    this.components.sortableTable.updateClear(data);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', (event) => {
      const { from, to } = event.detail;

      this.updateComponents(from, to)
    })
  }

  renderComponents () {
    for (const key of Object.keys(this.components)) {
      this.subElements[key].append(this.components[key].element)
    }
  }

  render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTeamplate();

    const element = wrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements();
    select();

    this.initCompinents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements () {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
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
