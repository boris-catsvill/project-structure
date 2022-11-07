import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  range = {
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  };
  url = new URL('api/dashboard/bestsellers', process.env.BACKEND_URL);

  initialize() {
    this.initEventListeners();
  }

  getTemplate() {
    return `
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
    `;
  }

  initComponents() {
    const from = this.range.from;
    const to = this.range.to;

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true,
      range: {
        from,
        to
      },
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      },
      label: 'orders',
      link: '/sales'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'customers',
    });

    this.components = {
      sortableTable,
      rangePicker,
      ordersChart,
      salesChart,
      customersChart
    };
  }

  getComponents() {
    this.subElements.rangePicker.append(this.components.rangePicker.element);
    this.subElements.sortableTable.append(this.components.sortableTable.element);
    this.subElements.ordersChart.append(this.components.ordersChart.element);
    this.subElements.salesChart.append(this.components.salesChart.element);
    this.subElements.customersChart.append(this.components.customersChart.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll(`[data-element]`);

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.getComponents();
    this.initEventListeners();
    
    this.update(this.range.from, this.range.to);
    
    return this.element;
  }

  onRangeSelect = (event) => {
    const { from, to } = event.detail;

    this.update(from, to);
  }

  async loadData(from, to) {
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '20');
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    return data;
  }

  async update(from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.onRangeSelect);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.components = {};
  }

}
