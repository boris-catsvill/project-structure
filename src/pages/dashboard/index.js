import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = process.env.BACKEND_URL;

import fetchJson from '../../utils/fetch-json.js';

export default class DashboardPage {
  constructor() {

    this.initComponents();
    this.initEventListeners();
  }

  initComponents() {
    const from = new Date('2020-04-06');
    const to = new Date('2020-05-06');

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${from}&to=${to}&_sort=title&_order=asc&_start=0&_end=30`,
      isSortLocally: true,
    });

    const rangePicker = new RangePicker({
      from,
      to,
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to,
      },
      label: 'orders',
      link: '#'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to,
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to,
      },
      label: 'customers',
    });

    this.components = {
      sortableTable,
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
    };
  }

  getTemplate() {
    return `
          <div class="dashboard full-height flex-column">
              <div class="content__top-panel">
                <h2 class="page-title">Панель управления</h2>
                <div data-element="rangePicker" class="rangepicker"></div>
              </div>
              <div class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
              </div>
              <h3 class="block-title">Лидеры продаж</h3>
              <div class="products-list__container">
                <div data-element="sortableTable"></div>
              </div>
          </div>
      `;
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    const subElementsFields = Object.keys(this.subElements);

    for (const index in subElementsFields) {
      const elementField = subElementsFields[index];

      this.subElements[elementField].append(this.components[elementField].element);
    }

    return this.element;
  }

  async updateComponents(from, to) {
    const {
      sortableTable,
      ordersChart,
      salesChart,
      customersChart
    } = this.components;

    sortableTable.element.classList.add('sortable-table_loading');

    const data = await fetchJson(`${BACKEND_URL}api/dashboard/bestsellers?from=${from}&to=${to}&_sort=title&_order=asc&_start=0&_end=30`);

    sortableTable.element.classList.add('sortable-table_loading');

    if (data.length) {
      sortableTable.addRows(data);
    } else {
      sortableTable.element.classList.add('sortable-table_empty');
    }

    ordersChart.update(from, to);
    salesChart.update(from, to);
    customersChart.update(from, to);
  }

  initEventListeners() {
    const { rangePicker } = this.components;

    const onUpdatePage = (event) => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    };

    rangePicker.element.addEventListener('date-select', onUpdatePage);
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

  remove() {
    this.destroy();
  }

  destroy() {
    this.element.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}