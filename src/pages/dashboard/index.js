import RangePicker from './../../components/range-picker/index.js';
import SortableTable from './../../components/sortable-table/index.js';
import ColumnChart from './../../components/column-chart/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
  abortController = new AbortController();
  startDate = new Date(2022, 9, 1);
  pageComponents = [];

  render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();

    this.createPageComponents();
    this.renderPageElements();
    this.addEventListeners();

    return this.element;
  }

  addEventListeners() {
    const {rangePicker} = this.subElements;

    rangePicker.addEventListener(
      'date-select',
      this.onDateSelect,
      this.abortController.signal
    );
  }

  onDateSelect = event => {
    const {from, to} = event.detail;
    this.updateColumnChart(from, to);
  };

  updateColumnChart(from, to) {
    Object.entries(this.pageComponents)
      .filter(([name, _chart]) => name.includes("Chart"))
      .forEach(([_name, chart]) => chart.update(from, to));
  }

  createPageComponents() {
    const rangePicker = new RangePicker(this.getRange());
    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      label: 'orders',
      range: this.getRange(),
      link: '#'
    });
    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: this.getRange(),
      label: 'customers',
    });
    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: this.getRange(),
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    const url = new URL('/api/dashboard/bestsellers', BACKEND_URL);
    const sortableTable = new SortableTable(header, {url});

    this.pageComponents = {rangePicker, ordersChart, customersChart, salesChart, sortableTable};
  }

  renderPageElements() {
    Object.entries(this.pageComponents).forEach(([name, component]) => {
      const subElement = this.subElements[name];
      if (!subElement) {
        return;
      }
      subElement.append(component.element);
    });
  }

  getRange = () => {
    const now = new Date(this.startDate.getTime());
    const to = new Date(this.startDate.getTime());
    const from = new Date(now.setMonth(now.getMonth() - 1));

    return {from, to};
  };

  getTemplate() {
    return `
      <section class="content" id="content">
        <div class="dashboard">
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
        </div>
      </section>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    this.abortController.abort();
    Object.values(this.pageComponents).forEach(value => value.destroy());
    this.pageComponents = null;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }
}
