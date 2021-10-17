import BasePage from '../base-page/index.js';
import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import Notification from '../../components/notification/index.js';
import header from './bestsellers-header.js';
import { LOCALE, NOTIFICATION_TYPE, ORDERS_URL, SALES_URL, CUSTOMERS_URL, BESTSELLERS_URL } from '../../constants/index.js';

const URL_PATH = process.env.URL_PATH;

export default class Page extends BasePage {
  onDateSelect = event => {
    this.updateComponents(event.detail.from, event.detail.to);
  }

  constructor(path) {
    super(path);
  }

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect);
  }

  get template() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  async getComponents() {
    const today = new Date();

    const to = new Date(today);
    const from = new Date(today.setMonth(today.getMonth() - 1));

    const rangePicker = new RangePicker({from, to});

    const ordersChart = new ColumnChart({
      url: ORDERS_URL,
      label: 'Заказы',
      range: {from, to},
      link: `/${URL_PATH}sales`
    });

    const salesChart = new ColumnChart({
      url: SALES_URL,
      label: 'Продажи',
      range: {from, to},
      formatHeading: data => `$${data.toLocaleString(LOCALE)}`
    });

    const customersChart = new ColumnChart({
      url: CUSTOMERS_URL,
      label: 'Клиенты',
      range: {from, to}
    });

    const sortableTable = new SortableTable(header, {
      url: `${BESTSELLERS_URL}?from=${from.toISOString()}&to=${to.toISOString()}`,
      sortLocally: true,
      scrollable: false,
      rowUrl: row => `/${URL_PATH}products/${row.id}`
    });

    return {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  async updateComponents(from, to) {
    Promise.all([
      this.components.ordersChart.update(from, to),
      this.components.salesChart.update(from, to),
      this.components.customersChart.update(from, to),
      this.components.sortableTable.update({from: from.toISOString(), to: to.toISOString()})
    ]).catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }
}
