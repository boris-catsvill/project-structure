import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js'; 
import header from './bestsellers-header.js';

export default class Page {
  element;
  subElements = {};
  usedComponents = {};

  get templateDashboard() {
    return `<div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <div data-element="rangePicker"></div>
            </div>
            <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>
            <h3 class="block-title">Best sellers</h3>
            <div data-element="sortableTable">
            </div>`;
  }

  fillSubElements() {
    const allDataElem = this.element.querySelectorAll("[data-element]");
    for (const element of allDataElem) {
      this.subElements[element.dataset.element] = element;
    }
  }

  onRangeChange = (event) => {
    const {
      from,
      to
    } = event.detail;
    for (const [key, value] of Object.entries(this.usedComponents)) {
      switch (key) {
        case 'rangePicker':
          break;
        case 'sortableTable':
          value.range = event.detail;
          const {
            id, order
          } = value.sorted;
          const {
            start, end
          } = value;
          value.sortOnServer(id, order, start, end);
          break;
        default:
          value.update(from, to);
          break;
      }

    }

  }

  async render() {

    this.element = document.createElement('div');
    this.element.classList.add('dashboard');
    this.element.innerHTML = this.templateDashboard;
    this.fillSubElements();

    const now = new Date();
    this.usedComponents.rangePicker = new RangePicker({to: new Date(), from: new Date(now.setMonth(now.getMonth() - 1))});
    this.usedComponents.rangePicker.element.addEventListener('date-select', this.onRangeChange);
    this.usedComponents.sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true,
      range: this.usedComponents.rangePicker.selected
    });
    this.usedComponents.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: this.usedComponents.rangePicker.selected,
      label: 'orders',
      link: '/sales'
    });

    this.usedComponents.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: this.usedComponents.rangePicker.selected,
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    this.usedComponents.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: this.usedComponents.rangePicker.selected,
      label: 'customers',
    });

    for (const [key, value] of Object.entries(this.usedComponents)) {
      this.subElements[key].append(value.element);
    }

    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove;
    }
    this.element = null;
  }

  destroy() {
    Object.values(this.usedComponents).forEach(value => {
      value.destroy();
    });
    this.remove();
    this.usedComponents = null;
    this.subElements = null;
  }

}
