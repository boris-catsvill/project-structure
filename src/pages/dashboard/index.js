import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  element = {};
  subElements = {};
  range = {};
  components = {};
  controller = new AbortController();

  constructor() {
    const date = new Date();
    this.range = {
      to: new Date(date),
      from: new Date(date.setMonth(date.getMonth() - 1))
    };
    this.charts = [
      {
        url: 'api/dashboard/orders',
        range: this.range,
        label: 'orders',
        name: 'ordersChart'
      },
      {
        url: 'api/dashboard/sales',
        range: this.range,
        label: 'sales',
        formatHeading: data => `$${data}`,
        name: 'salesChart'
      },
      {
        url: 'api/dashboard/customers',
        range: this.range,
        label: 'customers',
        name: 'customersChart'
      }
    ];
  }
  async render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;
    this.getSubElements();
    this.initComponents();
    this.appendComponents();
    this.initListeners();

    return this.element;
  }
  initComponents() {
    this.components['rangePicker'] = new RangePicker(this.range);

    this.components['sortableTable'] = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true,
      range: this.range
    });

    this.charts.forEach(item => {
      this.components[item.name] = new ColumnChart(item);
    });
  }

  appendComponents() {
    for (const [name, instance] of Object.entries(this.components)) {
      if (Object.hasOwn(this.subElements, name)) {
        this.subElements[name].append(instance.element);
      }
    }
  }

  initListeners() {
    document.addEventListener('date-select', this.rangeChanged, {
      signal: this.controller.signal
    });
  }

  rangeChanged = async ({ detail }) => {
    this.range = detail;

    for (const instance of Object.values(this.components)) {
      if (instance instanceof ColumnChart) {
        instance.update(this.range.from, this.range.to);
      }
      if (instance instanceof SortableTable) {
        instance.loadData(this.range);
      }
    }
  };

  getSubElements() {
    for (const item of this.element.querySelectorAll('[data-element]')) {
      this.subElements[item.dataset.element] = item;
    }
  }
  getTemplate() {
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
    </div>`;
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
    this.charts = null;
    this.controller.abort();

    for (const instance of Object.values(this.components)) {
      if (Object.hasOwn(instance, 'destroy')) {
        instance.destroy();
      }
    }
    this.components = null;
  }
}
