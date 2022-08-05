import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.dateRange = this.dateSelection.bind(this);
  }

  updateComponents(from, to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
    this.components.sortableTable.updateData(from, to);
  }

  get template() {
    return `<div class="dashboard full-height flex-column">
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
      <div data-element="sortableTable"></div>
      </div>
      `;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({from, to});

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      },
      label: 'orders',
      link: '#',
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'sales',
      link: '#',
    });
    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'customers',
      link: '#',
    });

    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      range: {
        from,
        to
      },
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
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];
      root.append(element);
    });
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.addListeners();

    return this.element;
  }

  getSubElements(element) {
    let elements = element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  dateSelection(event) {
    const {from, to} = event.detail;
    this.updateComponents(from, to);
  }

  addListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.dateRange);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
    this.components.rangePicker.element.removeEventListener('date-select', this.dateRange);
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
