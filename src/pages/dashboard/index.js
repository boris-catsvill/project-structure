import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element

  constructor() {
    this.to = new Date()
    
    this.from = new Date()
    this.from.setMonth(this.from.getMonth() - 1);

    this.url = new URL(`${BACKEND_URL}api/dashboard/bestsellers`)
    this.url.searchParams.set('from', this.from.toISOString())
    this.url.searchParams.set('to', this.to.toISOString())
  }

  
  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements()
    this.componentsObj = {}

    this.initComponents()
    this.appendComponents()
    this.initEventListeners()

    return this.element
  }

  initComponents() {
    this.initRangePicker()
    this.initColumnChart()
    this.initSortableTable()
  }

  async updateComponents() {
    this.url.searchParams.set('from', this.from.toISOString())
    this.url.searchParams.set('to', this.to.toISOString())

    this.componentsObj.sortableTable.updateData(this.url)

    this.componentsObj.ordersChart.update(this.from.toISOString(), this.to.toISOString())
    this.componentsObj.salesChart.update(this.from.toISOString(), this.to.toISOString())
    this.componentsObj.customersChart.update(this.from.toISOString(), this.to.toISOString())
  }

  initRangePicker() {
    const rangePicker = new RangePicker({from: this.from, to: this.to})
    this.componentsObj.rangePicker = rangePicker
  }

  initColumnChart(from = this.from, to = this.to) {
    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      label: 'orders',
      range: {
        from: from,
        to: to
      },
      link: 'sales',
    })
    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'sales',
      range: {
        from: from,
        to: to
      },
      formatHeading: data => `${new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(data)}`,
    })
    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      label: 'customers',
      range: {
        from: from,
        to: to
      },
    })

    this.componentsObj.ordersChart = ordersChart
    this.componentsObj.salesChart = salesChart
    this.componentsObj.customersChart = customersChart
  }

  initSortableTable(url = this.url.href) {
    const sortableTable = new SortableTable(header, {
      url: url,
      isSortLocally: true,
    });

    this.componentsObj.sortableTable = sortableTable
  }

  appendComponents() {
    Object.keys(this.componentsObj).forEach(componentName => {
      this.subElements[componentName].append(this.componentsObj[componentName].element)
    })
  }

  initEventListeners() {
    this.componentsObj.rangePicker.element.addEventListener('date-select', this.dateSelectEvent)
  }

  dateSelectEvent = event => {
    this.from = event.detail.from
    this.to = event.detail.to
    this.updateComponents()
  }

  getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]')

    return [...subElements].reduce((accum, element) => {
      accum[element.dataset.element] = element

      return accum
    }, {})
  }

  get template() {
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Object.keys(this.componentsObj).forEach(componentName => this.componentsObj[componentName].destroy())
    document.removeEventListener('date-select', this.dateSelectEvent)
  }
}
