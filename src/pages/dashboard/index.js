import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  components = {};
  subElements = {};

  get getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>

        <div data-element="chartsContainer" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable" class="sortable-table"></div>
      </div>
    `;
  }

  get getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]');

    return [...subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements;
    this.subElements.progressBar = document.querySelector('.progress-bar');

    this.initComponents();
    this.renderComponents();
    this.addEventListeners();

    return this.element;
  }

  async updateComponents(from, to) {
    const {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart
    } = this.components;

    const data = await sortableTable.loadData(
      sortableTable.sorted.id,
      sortableTable.sorted.order,
      0,
      19,
      from,
      to
    );

    sortableTable.addRows(data);
    ordersChart.update(from, to);
    salesChart.update(from, to);
    customersChart.update(from, to);
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      className: 'orders',
      label: 'Заказы',
      link: '/sales',
      range: {
        from,
        to
      }
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      className: 'sales',
      label: 'Продажи',
      formatHeading: data => this.formatSales(data),
      range: {
        from,
        to
      }
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      className: 'customers',
      label: 'Клиенты',
      range: {
        from,
        to
      }
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers`,
      from,
      to,
      start: 0,
      step: 30,
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
    Object.entries(this.components).forEach(([title, component]) => {
      const container = this.subElements[title];

      container.append(component.element);
    });
  }

  addEventListeners() {
    const { element } = this.components.rangePicker;

    element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  formatSales(data) {
    return data.toLocaleString('en', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
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
