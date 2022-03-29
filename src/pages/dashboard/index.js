import RangePicker from '../../components/range-picker/';
import SortableTable from '../../components/sortable-table/';
import ColumnChart from '../../components/column-chart/';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json';

export default class Page {
  element = null;
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', process.env.BACKEND_URL);
  get template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div class="rangepicker" data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot"git  class="dashboard__charts">
            <div class="dashboard__chart_orders" data-element="ordersChart"></div>
            <div class="dashboard__chart_sales" data-element="salesChart"></div>
            <div class="dashboard__chart_customers" data-element="customersChart"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  initComponents = () => {
    
    const to = new Date();
    const from = new Date();
    from.setMonth(to.getMonth() - 1);

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '21');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');

    const rangePicker = new RangePicker({
      from,
      to
    });

    const ordersChart = new ColumnChart({
      label: 'Заказы',
      link: '/sales',
      range: {
        from,
        to
      },
      url: 'api/dashboard/orders'
    });

    const salesChart = new ColumnChart({
      label: 'Продажи',
      range: {
        from,
        to,
      },
      url: 'api/dashboard/sales',
      formatHeading: (data) => `$${data}`,
    });

    const customersChart = new ColumnChart({
      label: 'Клиенты',
      range: {
        from,
        to,
      },
      url: 'api/dashboard/customers',
    });

    const sortableTable = new SortableTable(header, {
      isSortLocally: true,
      url: this.url,
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  };

  addedComponents = () => {
    Object.keys(this.components).forEach(item => {
      this.subElements[item].append(this.components[item].element);
    });
  };

  render = async () => {
    const wrapper = document.createElement('div');
    wrapper.insertAdjacentHTML('beforeend', this.template);

    this.element = wrapper.firstElementChild;

    this.getSubElements();
    this.initComponents();
    this.addedComponents();
    this.initEventListeners();

    return this.element;
  };

  updateComponents = async (from, to) => {
    const data = await this.loadData(from, to);
    
    const { sortableTable, ordersChart, salesChart, customersChart } = this.components;
    
    sortableTable.update(data);
    await Promise.all([
      ordersChart.update(from, to),
      salesChart.update(from, to),
      customersChart.update(from, to),
    ]);
  };

  loadData = async (from, to) => {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '21');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');

    return await fetchJson(this.url);
  };

  initEventListeners = () => {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  };

  getSubElements = () => {
    this.subElements = [...this.element.querySelectorAll('[data-element]')]
    .reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    this.subElements = {};
    this.element = null;

    Object.values(this.components).forEach(item => {
      item.destroy();
    });
  };
}
