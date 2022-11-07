import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';
import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', process.env.BACKEND_URL);


  async updateComponents (from, to) {
    const data = await this.loadData(from, to);

    this.element.querySelector('.sortable-table__body').innerHTML = '';
    this.components.sortableTable.update(data);

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    return data;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Панель управления</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker">

        </div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Лидеры продаж</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->

      </div>
    </div>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const formatHeading = value => `$${new Intl.NumberFormat('en-EN').format(value)}`;

    const rangePicker = new RangePicker({
      from,
      to
    })

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=0&_end=30&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    })
    sortableTable.onWindowScroll = null;

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to,
      },
      label: 'Заказы',
      link: '/sales',
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'Продажи',
      formatHeading
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'Клиенты',
    });

    this.components = {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
      rangePicker
    }
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    })
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
