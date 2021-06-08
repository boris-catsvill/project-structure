import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  components = {};
  subElements = {};

  handlerDateSelect = event => {
    const { from, to } = event.detail;

    // noinspection JSIgnoredPromiseFromCall
    this.updateComponents(from, to);
  };

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const components = this.initComponents();
    this.renderComponents(components);
    this.components = components;

    this.addEventListeners();

    return this.element;
  }

  initComponents() {
    const date = new Date();
    const period = {
      from: new Date(date.setMonth(date.getMonth() - 1)),
      to: new Date()
    };

    this.urlBestsellers =  new URL('/api/dashboard/bestsellers', process.env.BACKEND_URL);
    this.urlBestsellers.searchParams.set('from', period.from.toISOString());
    this.urlBestsellers.searchParams.set('to', period.to.toISOString());

    // Компоненты
    const rangePicker = new RangePicker(period);

    const sortableTable = new SortableTable(header, {
      url: this.urlBestsellers,
      isSortLocally: true
    });

    const ordersChart = new ColumnChart({
      label: 'orders',
      url: 'api/dashboard/orders',
      range: period
    });
    ordersChart.element.classList.add('dashboard__chart_orders');

    const salesChart = new ColumnChart({
      label: 'sales',
      formatHeading: data => `$${data}`,
      url: 'api/dashboard/sales',
      range: period
    });
    salesChart.element.classList.add('dashboard__chart_sales');

    const customersChart = new ColumnChart({
      label: 'customers',
      url: 'api/dashboard/customers',
      range: period
    });
    customersChart.element.classList.add('dashboard__chart_customers');

    return {
      rangePicker,
      sortableTable,
      ordersChart,
      salesChart,
      customersChart
    };
  }

  renderComponents(components) {
    const keysComponents = Object.keys(components);

    keysComponents.forEach(component => {
      const root = this.subElements[component];
      const { element } = components[component];

      root.append(element);
    });
  }

  async updateComponents(from, to) {
    const { sortableTable, ordersChart, salesChart, customersChart } = this.components;

    this.urlBestsellers.searchParams.set('from', from.toISOString());
    this.urlBestsellers.searchParams.set('to', to.toISOString());

    sortableTable.update(this.urlBestsellers);
    ordersChart.update(from, to);
    salesChart.update(from, to);
    customersChart.update(from, to);
  }

  addEventListeners() {
    const { rangePicker } = this.components;

    rangePicker.element.addEventListener('date-select', this.handlerDateSelect);
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

  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <div data-element="ordersChart"></div>
          <div data-element="salesChart"></div>
          <div data-element="customersChart"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
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
