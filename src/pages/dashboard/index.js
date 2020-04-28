import SortableTable from "../../components/sortable-table/index.js";
import header from './bestsellers-header.js';
import ColumnChart from "../../components/column-chart/index.js";

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor () {
    this.initComponents();
    this.initEventListeners();
  }

  initComponents () {
    // TODO: replace by API for Bestsellers products
    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products'
    });

    const ordersData = [];
    const salesData = [ 30, 40, 20, 80, 35, 15 ];
    const customersData = [ 100, 90, 80, 35, 90, 25 ];

    // TODO: replace "mocked" data by real API calls
    const ordersChart = new ColumnChart({
      data: ordersData,
      label: 'orders',
      value: 344,
      link: '#'
    });

    // TODO: replace "mocked" data by real API calls
    const salesChart = new ColumnChart({
      data: salesData,
      label: 'sales',
      value: '$243,437'
    });

    // TODO: replace "mocked" data by real API calls
    const customersChart = new ColumnChart({
      data: customersData,
      label: 'customers',
      value: 321
    });

    this.components.sortableTable = sortableTable;
    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;
  }

  get template () {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>

        <!-- TODO: add RangePicker component -->
        <!--<div data-element="rangePickerRoot">-->
          <!-- range-picker component -->
        <!--</div>-->
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

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.renderComponents();

    return this.element;
  }

  async renderComponents () {
    // NOTE: All renders in components are async (check in components)
    const promises = Object.values(this.components).map(item => item.render());
    const elements = await Promise.all(promises);

    Object.keys(this.components).forEach((component, index) => {
      this.subElements[component].append(elements[index]);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    // TODO: add addEventListener for RangePicker event
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
