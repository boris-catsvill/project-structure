import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  subElements = {};
  components = {};
  defaultFrom = new Date();
  defaultTo = new Date();
  url;

  setDefaultRange() {
    const month = this.defaultTo.getMonth();
    this.defaultFrom.setMonth(month - 1);

    if (this.defaultFrom.getMonth() === month) {
      this.defaultFrom.setDate(0);
      this.defaultFrom.setHours(0, 0, 0, 0);
    }
  }

  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker" class="rangepicker"></div>
        </div>
        <div class="dashboard__charts">
          <div data-element="ordersChart" class="column-chart dashboard__chart_orders"></div>
          <div data-element="salesChart" class="column-chart dashboard__chart_sales"></div>
          <div data-element="customersChart" class="column-chart dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable" class="sortable-table"></div>
      </div>
`
  }

  urlInitializer() {
    this.url = new URL('api/dashboard/bestsellers', process.env.BACKEND_URL);
    this.url.searchParams.set('from', this.defaultFrom.toISOString());
    this.url.searchParams.set('to', this.defaultTo.toISOString());
  }

  renderLinkItem(dataItem) {
    return `
      <a href="/products/${dataItem.id}" class="sortable-table__row">
        ${this.headerConfig.find(obj => obj.id === 'images').template(dataItem.images)}
        <div class="sortable-table__cell">${dataItem.title}</div>
        ${this.headerConfig.find(obj => obj.id === 'subcategory').template(dataItem.subcategory)}
        <div class="sortable-table__cell">${dataItem.quantity}</div>
        ${this.headerConfig.find(obj => obj.id === 'price').template(dataItem.price)}
        <div class="sortable-table__cell">${dataItem.sales}</div>
      </a>
      `
  }

  formatHeading(data) {
    const currencyAmountFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
    return currencyAmountFormatter.format(data)
  }

  initialize() {
    this.urlInitializer();
    this.components = {
      rangePicker: new RangePicker({ from: this.defaultFrom, to: this.defaultTo }),
      ordersChart: new ColumnChart({
        range: {
          from: this.defaultFrom,
          to: this.defaultTo
        },
        url: 'api/dashboard/orders',
        label: 'orders',
        link: '/sales',
        linkDescription: 'Details',
      }),
      salesChart: new ColumnChart({
        range: {
          from: this.defaultFrom,
          to: this.defaultTo
        },
        url: 'api/dashboard/sales',
        label: 'sales',
        formatHeading: this.formatHeading
      }),
      customersChart: new ColumnChart({
        range: {
          from: this.defaultFrom,
          to: this.defaultTo
        },
        url: 'api/dashboard/customers',
        label: 'customers',
      }),
      sortableTable: new SortableTable(header, {
        url: this.url,
        sorted: {
          order: 'desc',
          id: 'title'
        },
        renderLinkItem: this.renderLinkItem,
      })
    }

    this.renderComponents();
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.setDefaultRange();
    this.subElements = this.getSubElements(this.element);
    this.initialize();
    this.attachEventListeners();
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accumulator, subElement) => {
      accumulator[subElement.dataset.element] = subElement;
      return accumulator;
    }, {})
  }

  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const container = this.subElements[component];
      const { element } = this.components[component];
      container.append(element);
    })
  }

  async updateComponents(range) {
    this.components.ordersChart.update(range.detail.from, range.detail.to);
    this.components.salesChart.update(range.detail.from, range.detail.to);
    this.components.customersChart.update(range.detail.from, range.detail.to);

    this.url.searchParams.set('from', range.detail.from.toISOString());
    this.url.searchParams.set('to', range.detail.to.toISOString());
    this.components.sortableTable.sortOnServer({
      updatedURL: this.url
    })
  }

  dateSelectHandler = (event) => {
    this.updateComponents(event);
  }

  attachEventListeners() {
    document.addEventListener('date-select', this.dateSelectHandler);
  }

  removeListeners() {
    document.removeEventListener('date-select', this.dateSelectHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeListeners();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
    this.subElements = null;
  }
}
