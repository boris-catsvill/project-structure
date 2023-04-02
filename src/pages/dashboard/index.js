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
  from = new Date();
  to = new Date();

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.initComponents();
    this.renderComponents();
    this.initEventListeners();
    return this.element;
  }
  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, elem) => {
      acc[elem.dataset.element] = elem;
      return acc;
    }, {});
  }

  initComponents() {
    const to = (this.to = new Date());
    const from = (this.from = new Date(to.getFullYear(), to.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const ordersChart = new ColumnChart({
      url: `api/dashboard/orders`,
      range: {
        from,
        to
      },
      label: 'Заказы',
      link: '/products'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'Продажи',
      formatHeading: data => `$${data.toLocaleString('en-US')}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'Клиенты'
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${this.from.toISOString()}&to=${this.to.toISOString()}`,
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
    Object.entries(this.components).forEach(([key, value]) => {
      this.subElements[key].append(value.element);
    });
  }
  getTemplate() {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div></div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers">
        </div></div> <h3 class="block-title">Лидеры продаж</h3>
      <div data-element="sortableTable">
      </div>
    </div>`;
  }

  async updateBestSellers(from, to) {
    const response = await this.loadData(from, to);
    this.components.sortableTable.update(response);
    this.components.sortableTable.removeEventListener();
  }

  loadData(from, to) {
    const {
      start,
      end,
      sorted: { id, order }
    } = this.components.sortableTable;

    const url = new URL('api/dashboard/bestsellers', BACKEND_URL);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());
    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);
    return fetchJson(url);
  }

  updateColumnChart(from, to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }
  initEventListeners() {
    const { rangePicker } = this.components;
    rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateColumnChart(from, to);
      this.updateBestSellers(from, to);
    });
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.subElements = null;
    this.element = null;
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
