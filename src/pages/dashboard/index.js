import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import ColumnChart from '../../components/column-chart';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const URL_PATH = process.env.URL_PATH;

export default class Page {
  element;
  subElements = {};
  components = {};

  get template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <div class="dashboard__chart_orders" data-element="ordersChart"></div>
          <div class="dashboard__chart_sales" data-element="salesChart"></div>
          <div class="dashboard__chart_customers" data-element="customersChart"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListners();

    return this.element;
  }

  initEventListners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  async updateComponents(from, to) {
    const url = new URL('api/dashboard/bestsellers', process.env.BACKEND_URL);
    url.searchParams.set('_start', 0);
    url.searchParams.set('_end', 30);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());
    url.searchParams.set('_sort', 'sales');
    url.searchParams.set('_order', 'desc');

    const data = await fetchJson(url);

    this.components.sortableTable.update(data);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  initComponents() {    
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);

    const rangePicker = new RangePicker({ from, to });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`,
      sorted: {
        id: 'sales',
        order: 'desc',
      },
      start: 0,
      end: 30,
      isSortLocally: true,
      rowUrlTemplate: row => `/${URL_PATH}products/${row.id}`,
    });

    const formatTooltip = (key, value) => `
      <div>
        <small>${(new Date(key)).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' })}</small>
      </div>
      <strong>${value}</strong>
    `;

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to,
      },
      label: 'Заказы',
      link: `${URL_PATH}sales`,
      formatTooltip,
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to,
      },
      label: 'Продажи',
      formatHeading: data => `$${data.toLocaleString('en-US')}`,
      formatTooltip: (key, value) => `
        <div>
          <small>${(new Date(key)).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' })}</small>
        </div>
        <strong>$${value.toLocaleString('en-US')}</strong>
      `,
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to,
      },
      label: 'Клиенты',
      formatTooltip,
    });

    this.components = {
      rangePicker,
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.remove();

    this.element = null;
    this.subElements = null;
    this.components = null;
  }
}
