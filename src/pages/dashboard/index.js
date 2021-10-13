import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';
import { findSubElements } from '../../utils/find-sub-elements';

const ORDERS_URL = '/api/dashboard/orders';
const SALES_URL = '/api/dashboard/sales';
const CUSTOMERS_URL = '/api/dashboard/customers';
const BEST_SELLERS_URL = 'api/dashboard/bestsellers';
const PRODUCTS_URL = '/products/';

const DASHBOARD_TITLE = 'Панель управления';
const ORDERS_LABEL = 'Orders';
const SALES_LABEL = 'Sales';
const CUSTOMERS_LABEL = 'Customers';
const BEST_SELLERS_TITLE = 'Лидеры продаж';

export default class DashboardPage {
  element;
  now = new Date();
  range = {
    from: new Date(this.now.setMonth(this.now.getMonth() - 1)),
    to: new Date()
  };

  subElements = {
    contentPanel: void 0,
    ordersChart: void 0,
    salesChart: void 0,
    customersChart: void 0,
    sortableTable: void 0,
    rangePicker: void 0
  };

  constructor() {
  }

  datePickerCreator = () => (new RangePicker(this.range));
  ordersCreator = () => (new ColumnChart({
    label: ORDERS_LABEL,
    url: ORDERS_URL,
    range: this.range
  }));
  sellersCreator = () => (new ColumnChart({
    label: SALES_LABEL,
    url: SALES_URL,
    range: this.range,
    formatHeading: data => `$${data}`
  }));
  customersCreator = () => (new ColumnChart({
    label: CUSTOMERS_LABEL,
    url: CUSTOMERS_URL,
    range: this.range
  }));

  bestSellersCreator = () => (new SortableTable(
    header,
    {
      url: BEST_SELLERS_URL,
      isSortLocally: true,
      range: this.range,
      rowClickUrl: PRODUCTS_URL
    }
  ));


  getTemplatePage = () => `
   <div class='dashboard'>
      <div class='content__top-panel' data-element='contentPanel'>
        <h2 class='page-title'>${DASHBOARD_TITLE}</h2>
        <div data-element='rangePicker'></div>
      </div>
      <div class='dashboard__charts'>
       <div id='orders' class='dashboard__chart_orders' data-element='ordersChart'></div>
       <div id='sales' class='dashboard__chart_sales'  data-element='salesChart'></div>
       <div id='customers' class='dashboard__chart_customers'  data-element='customersChart'></div>
      </div>
      <h3 class='block-title'>${BEST_SELLERS_TITLE}</h3>
      <div data-element='sortableTable'></div>
    </div>
  `;

  updateComponents = (range) => {
    void this.sortableTable.update(range);
    void this.salesChart.update(range);
    void this.ordersChart.update(range);
    void this.customersChart.update(range);
  };

  renderComponents = async () => {
    this.subElements = findSubElements(this.element);

    this.rangePicker = this.datePickerCreator();
    this.sortableTable = await this.bestSellersCreator();
    this.ordersChart = this.ordersCreator();
    this.salesChart = this.sellersCreator();
    this.customersChart = this.customersCreator();

    this.subElements.rangePicker.append(this.rangePicker.element);
    this.subElements.sortableTable.append(this.sortableTable.element);
    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);
  };

  addEventListeners = () => {
    this.element.addEventListener('date-select', ({ detail }) => {
      this.range = detail;
      this.subElements = {};
      this.updateComponents(detail);
    });
  };

  render = async () => {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplatePage();
    this.element = element.firstElementChild;
    await this.renderComponents();
    this.addEventListeners();
    return this.element;
  };
  remove = () => {
    this.element.remove();
  };
  destroy = () => {
    this.remove();
    this.subElements = {};
    this.rangePicker.destroy();
    this.sortableTable.destroy();
    this.ordersChart.destroy();
    this.salesChart.destroy();
    this.customersChart.destroy();
  };
}
