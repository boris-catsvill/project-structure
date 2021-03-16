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


  get template() {
    return `
  <div class="dashboard">
    <div class="content__top-panel">
      <h2 class="page-title">Dashboard</h2>
      <div data-element="rangePicker"></div>
    </div>
    <div data-element = "chartRoot" class="dashboard__charts">
      <div data-element = "ordersChart" class="dashboard__chart_orders"></div>
      <div data-element = "salesChart" class="dashboard__chart_sales"></div>
      <div data-element = "customersChart" class="dashboard__chart_customers"></div>
    </div>
    <h3 class="block-title">Best sellers</h3>
    <div data-element="sortableTable"></div>
  </div>
`;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    this.renderComponents();
    this.initEventListeners();
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  initComponents() {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));
    const rangePicker = new RangePicker({ //вызов конструктора
      from,
      to
    });
    
    const ordersChart = new ColumnChart({
      url: `api/dashboard/orders`,
      label: 'orders',
      range: {
        from,
        to
      }
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'sales',
      range: {
        from,
        to,
      }
      //formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      label: 'customers',
      range: {
        from,
        to,
      }
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
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
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component]; 
      const {element} = this.components[component];
      root.append(element);
    });
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const {from, to} = event.detail;
      
      this.updateComponents(from, to);
    });
  }

  async updateComponents(from, to) {
    const data = await fetchJson(`${BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`);
    this.components.sortableTable.addRows(data);
    this.components.sortableTable.update(data);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
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

