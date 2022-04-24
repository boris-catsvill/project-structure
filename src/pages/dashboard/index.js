import header from './bestsellers-header.js';
import ColumnChart from '../../components/column-chart/index.js';
import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import currencyFormatter from '../../utils/currency-formatter';

export default class Page {
  subElements = {};
  components = {};
  defaultRange = {
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  };

  get template() {
    return `
    <div class="dashboard full-height flex-column">
      <div class="content__top-panel">
        <h2 class="page-title">Панель управления</h2>
        <div data-element='rangePicker'></div>
      </div>
      <div class="dashboard__charts">
        <div data-element='ordersChart' class="dashboard__chart_orders"></div>
        <div data-element='salesChart' class="dashboard__chart_sales"></div>
        <div data-element='customersChart' class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Лидеры продаж</h3>
        <div data-element='sortableTable'></div>
    </div>
    `;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.components = this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const { from, to } = this.defaultRange;
    const rangePicker = new RangePicker({ from, to });

    const ordersChart = new ColumnChart({
      label: 'Заказы',
      link: 'sales',
      url: 'api/dashboard/orders',
      range: { from, to }
    });

    const salesChart = new ColumnChart({
      label: 'Продажи',
      formatHeading: data => currencyFormatter.format(data),
      url: 'api/dashboard/sales',
      range: { from, to }
    });

    const customersChart = new ColumnChart({
      label: 'Клиенты',
      url: 'api/dashboard/customers',
      range: { from, to }
    });

    const bestsellersURL = new URL('api/dashboard/bestsellers', process.env.BACKEND_URL);
    bestsellersURL.searchParams.set('from', from.toISOString());
    bestsellersURL.searchParams.set('to', to.toISOString());

    const sortableTable = new SortableTable(header, {
      url: bestsellersURL,
      getRowLink: id => `/products/${id}`,
      isSortLocally: true,
      sorted: {
        id: 'title',
        order: 'asc'
      }
    });

    return {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  renderComponents() {
    for (const componentName of Object.keys(this.components)) {
      const root = this.subElements[componentName];
      const element = this.components[componentName].element;

      root.append(element);
    }
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.components.ordersChart.update(from, to);
      this.components.salesChart.update(from, to);
      this.components.customersChart.update(from, to);
      this.updateTable(from, to);
    });
  }

  // Собственный метод для обновления таблицы
  async updateTable(from, to) {
    const table = this.components.sortableTable;

    table.start = 0;
    table.end = table.step;

    table.url.searchParams.set('from', from.toISOString());
    table.url.searchParams.set('to', to.toISOString());

    table.subElements.body.innerHTML = '';
    const data = await table.loadData(table.sorted.id, table.sorted.order, table.start, table.end);

    table.setRows(data);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};

    for (const component in this.components) {
      this.components[component].destroy();
    }

    this.components = {};
  }
}
