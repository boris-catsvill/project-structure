import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.initComponents();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `<div class="dashboard full-height flex-column">
              <div class="content__top-panel">
                <h2 class="page-title">Control panel</h2>
                <div data-element="rangePicker"></div>
              </div>
              <div class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
              </div>
              <h3 class="block-title">Sales leaders</h3>
              <div data-element="sortableTable"></div>
            </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll(`[data-element]`);
    const result = {};

    for (const element of elements) {
      result[element.dataset.element] = element;
    }

    return result;
  }

  initComponents() {
    let dt = new Date();

    let range = {
      from: new Date(dt.setMonth(dt.getMonth() - 1)),
      to: new Date(),
    }

    this.components.rangePicker = new RangePicker(range);

    this.components.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: range,
      label: 'orders',
      link: '/sales',
    });

    this.components.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: range,
      label: 'sales',
      formatHeading: data => data.toLocaleString(['en'], { style: 'currency', currency: 'USD', minimumFractionDigits: 0}),});

    this.components.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: range,
      label: 'customers',
    });

    this.components.sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true,
      sorted: {
        id: 'title',
        order: 'asc',
      },
      urlSettings: { "from": range.from, "to": range.to },
      isRowClickable: true,
    });

    for (let component of Object.keys(this.components)) {
      this.subElements[component].append(this.components[component].element);
    }
  }

  updateComponents = async (event) => {
    for (const component of Object.values(this.components)) {
      if (component.update) {
        component.update(event.detail);
      }
    }
  }

  addEventListeners() {
    this.components.rangePicker.element.addEventListener(`date-select`, this.updateComponents);
  }

  removeEventListeners() {
    this.components.rangePicker.element.removeEventListener(`date-select`, this.updateComponents);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
    this.element = null;
  }
}
