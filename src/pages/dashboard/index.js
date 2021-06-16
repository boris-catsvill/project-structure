import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = `${process.env.BACKEND_URL}`

export default class Page {

  element;
  subElements = {};
  components = {};

  initComponents() {

    const now = new Date();

    const from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const to = now

    const rangePicker = new RangePicker({
      from,
      to
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from: from,
        to: to,
      },
      label: 'Заказы',
      link: '#'
    });

    function formatData(data) {

      const i = data / 1000;
      const re = /(?=\B(?:\d{3})+(?!\d))/g;
      const j = i.toString().replace(re, ' ').replace('.', ',');
      return j
    }

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from: from,
        to: to,
      },
      label: 'Продажи',
      formatHeading: data => `$${formatData(data)}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from: from,
        to: to,
      },
      label: 'Клиенты',
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    });

    sortableTable.render();

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    }

    this.renderComponents()
    this.initEventListeners()
  }

  render() {

    const element = document.createElement('div');

    element.innerHTML = this.template();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(element);

    this.initComponents()

    return this.element
  }

  renderComponents() {

    for (const [component, { element }] of Object.entries(this.components)) {

      this.subElements[component].append(element)
    }
  }

  template() {
    return `
       <div class="dashboard">
         <div class="content__top-panel">
           <h2 class="page-title">Панель управления</h2>
           <div data-element="rangePicker"></div>
         </div>
      <div data-element="chartsRoot" class="dashboard__charts">
       <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Лидеры продаж</h3>
      <div data-element="sortableTable">
      </div>
    </div>
       `
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {

      result[item.dataset.element] = item;
      return result;

    }, {})
  }

  async updateComponents({ from, to }) {

    const data = await fetchJson(`${BACKEND_URL}api/dashboard/bestsellers?_start=0&_end=30&from=${from.toISOString()}&to=${to.toISOString()}&_sort=title&_order=asc`);

    this.components.sortableTable.updata(data);

    this.components.ordersChart.update({ from, to })
    this.components.salesChart.update({ from, to })
    this.components.customersChart.update({ from, to })
  }

  initEventListeners() {

    this.components.rangePicker.element.addEventListener('date-select', event => {

      const { from, to } = event.detail;
      this.updateComponents({ from, to })
    });

  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
