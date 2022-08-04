import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  constructor() {
      this.update()
  }

  async render() {
      this.element = this.getTemplate()
      this.subElements = this.getSubElements(this.element)
      this.initialize()
      return this.element
  }

  initialize() {
      const { from, to } = this.getRange();


      const sortableTable = this.getSortableTable(from, to)
      const rangePicker = this.getRangePicker(from, to)

      const ordersChart = new ColumnChart({
          url: 'api/dashboard/orders',
          range: {
              from,
              to
          },
          label: 'orders',
          link: '#'
      })

      const salesChart = new ColumnChart({
          url: 'api/dashboard/sales',
          range: {
              from,
              to
          },
          label: 'sales',
          formatHeading: data => `$${data}`
      })

      const customersChart = new ColumnChart({
          url: 'api/dashboard/customers',
          range: {
              from,
              to
          },
          label: 'customers',
      })

      this.components = { sortableTable, rangePicker, ordersChart, salesChart, customersChart }
      this.renderComponents()
  }

  renderComponents() {
      Object.keys(this.components).forEach(component => {
          const root = this.subElements[component]
          const element = this.components[component].element
          root.append(element)
      })

  }

  getSortableTable(from, to) {
      const sortableTable = new SortableTable(header, {
          url: 'api/dashboard/bestsellers',
          isSortLocally: true,
          from: from,
          to: to
      });
      return sortableTable
  }

  getRangePicker(from, to) {
      const rangePicker = new RangePicker({
          from: from,
          to: to
      })

      rangePicker.element.addEventListener('date-select', event => {
          this.range = event.detail
          this.update()
      });

      return rangePicker
  }

  getRange() {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));

      return { from, to };
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

  update() {
      if (!this.range) return
      const {from, to} = this.range

      Object.keys(this.components).forEach(component => {
          component != 'rangePicker' ? this.components[component].update(from, to) : ''
      })
  }

  getTemplate() {
      return this.createElement(`<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
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
      </div>
    </div>`)
  }

  createElement(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.firstElementChild;
  }



  remove() {
      this.element.remove();
  }

}
