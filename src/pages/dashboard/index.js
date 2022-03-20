import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import NotificationMessage from '../../components/notification/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element
  components = {}
  subElements = {}
  initialDate = {}

  constructor () {
    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 30);

    this.initialDate = {
      from: prevDate,
      to: new Date()
    };
  }

  initComponents () {
    const {from, to} = this.initialDate;

    const rangePicker = new RangePicker({ from, to });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      label: 'Заказы',
      range: { from, to },
      link: '/sales'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'Продажи',
      range: { from, to },
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: { from, to },
      label: 'Клиенты',
    });

    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      sorted: {
        id: header.find(item => item.sortable).id,
        order: 'asc'
      },
      from,
      to,
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

  get template () {
    return `<div class="dashboard">
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
    </div>`;
  }


  renderPage () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  async render () {
    try {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = this.template;

      this.element = wrapper.firstElementChild;
      this.subElements = this.getSubElements(this.element);

      this.initComponents();
      this.renderPage();

      this.subElements.rangePicker.addEventListener('date-select', this.updateRange);

      return this.element;
    } catch (error) {
      const notification = new NotificationMessage(error.message, {
        duration: 2000,
        type: 'error'
      });
  
      notification.show();
    }
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  updateRange = async (event) => {
    const { from, to } = event.detail;
      
    this.components.sortableTable.update(from, to);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.initialDate = {};
  }
}