import RangePicker from 'src/components/range-picker/index.js';
import SortableTable from 'src/components/sortable-table/index.js';
import ColumnChart from 'src/components/column-chart/index.js';
import header from './bestsellers-header.js';

//import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  constructor() {
    this.controller = new AbortController();
    this.loadingEvent = new CustomEvent('loading-components', {
      bubbles: true
    });
    this.loadedEvent = new CustomEvent('loaded-components', {
      bubbles: true
    })
  }

  getRange = () => {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    return {from, to};
  }

  initComponents() {
    this.rangePicker = new RangePicker(this.getRange());

    this.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: this.getRange(),
      label: 'orders',
      link: '#'
    });
    this.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: this.getRange(),
      label: 'sales',
      formatHeading: data => `$${data / 1000}`
    });
    this.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: this.getRange(),
      label: 'customers',
    });

    this.sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers`
    });

    this.components = {
      sortableTable: this.sortableTable,
      ordersChart: this.ordersChart,
      salesChart: this.salesChart,
      customersChart: this.customersChart,
      rangePicker: this.rangePicker
    };
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.updateComponents, {
      signal: this.controller.signal
    })
  }

  updateComponents = (event) => {
    this.loadingComponentEvent();
    const {from, to} = event.detail;

    Promise.all([
      this.customersChart.update(from, to),
      this.ordersChart.update(from, to),
      this.salesChart.update(from, to),
      this.sortableTable.update(from, to)
    ]).then(() => {
      this.loadedComponentEvent()
    })
  }

  loadedComponentEvent() {
    this.element.dispatchEvent(this.loadedEvent);
  }

  loadingComponentEvent() {
    this.element.dispatchEvent(this.loadingEvent);
  }

  renderComponents() {
    Object.keys(this.components).forEach(components => {
      const root = this.subElements[components];
      const {element} = this.components[components];

      root.append(element);
    });
  }

  render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();

    this.element = div.firstElementChild;
    this.subElements = this.getSubElements()

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]')

    for (let subElement of elements) {
      const name = subElement.dataset.element

      result[name] = subElement;
    }

    return result;
  }

  getTemplate() {
    return `<div class="dashboard full-height flex-column">
      <div class="content__top-panel" data-element="rangePicker">
        <h2 class="page-title">Панель управления</h2>
      </div>
      <div class="dashboard__charts" data-element="columnChart">
        <div data-element="ordersChart"></div>
        <div data-element="salesChart"></div>
        <div data-element="customersChart"></div>
      </div>
      <h3 class="block-title">Лидеры продаж</h3>
      <div data-element="sortableTable"></div>
    </div>`
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.controller.abort();
    this.components = {};

    for(const component of this.components){
      component.destroy();
    }
  }
}
