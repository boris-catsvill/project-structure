import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  components = {};
  from = new Date('10.24.2021');
  to = new Date();

  onChangeRange = event => {
    this.from = event.detail.from;
    this.to = event.detail.to;
    this.updateComponents();
  };

  render() {
    this.initComponents();
    this.element = this.toHTML(this.getTemplate());
    this.renderComponents();
    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();
    return this.element;
  }

  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-rangePicker></div>
        </div>
        <div class="dashboard__charts">
          <div data-ordersChart></div>
          <div data-salesChart></div>
          <div data-customersChart></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-sortableTable></div>
      </div>
    `;
  }

  initComponents() {
    const rangePicker = new RangePicker({ from: this.from, to: this.to });
    rangePicker.element.dataset.element = 'rangePicker';

    const ordersChart = new ColumnChart({
      label: 'orders',
      link: '/sales',
      url: 'api/dashboard/orders',
      range: { from: this.from, to: this.to }
    });
    ordersChart.element.classList.add('dashboard__chart_orders');
    ordersChart.element.dataset.element = 'ordersChart';

    const salesChart = new ColumnChart({
      label: 'sales',
      formatHeading: data => `$${data}`,
      url: 'api/dashboard/sales',
      range: { from: this.from, to: this.to }
    });
    salesChart.element.classList.add('dashboard__chart_sales');
    salesChart.element.dataset.element = 'salesChart';

    const customersChart = new ColumnChart({
      label: 'customers',
      url: 'api/dashboard/customers',
      range: { from: this.from, to: this.to }
    });
    customersChart.element.classList.add('dashboard__chart_customers');
    customersChart.element.dataset.element = 'customersChart';

    const sortableTable = this.initSortableTable();

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  initSortableTable() {
    const bestsellersUrl = new URL('api/dashboard/bestsellers', BACKEND_URL);
    bestsellersUrl.searchParams.set('from', this.from.toISOString());
    bestsellersUrl.searchParams.set('to', this.to.toISOString());
    const sortableTable = new SortableTable(header, {
      url: bestsellersUrl.toString()
    });
    sortableTable.element.dataset.element = 'sortableTable';

    return sortableTable;
  }

  renderComponents() {
    for (const component of Object.entries(this.components)) {
      this.element.querySelector(`[data-${component[0]}]`).replaceWith(component[1].element);
    }
  }

  updateComponents() {
    this.components.ordersChart.update(this.from, this.to);
    this.components.salesChart.update(this.from, this.to);
    this.components.customersChart.update(this.from, this.to);

    const sortableTable = this.initSortableTable();
    this.subElements.sortableTable.replaceWith(sortableTable.element);
    this.components.sortableTable.destroy();
    this.components.sortableTable = sortableTable;
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach(el => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  addEventListeners() {
    document.addEventListener('date-select', this.onChangeRange);
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}
