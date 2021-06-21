import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';


const today = new Date();
const monthAgo = new Date();
monthAgo.setMonth(today.getMonth() - 1);

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export default class Page {
  element = null;
  subElements = {};
  components = {};

  onDateChange = async ({ detail: { dateFrom, dateTo } }) => {
    await this.loadData(dateFrom, dateTo);
  };

  createComponents() {
    const initialDates = { from: monthAgo, to: today };
    this.components.rangePicker = new RangePicker(initialDates);


    this.components.ordersChart = new ColumnChart({
      label: 'Заказы',
      url: 'api/dashboard/orders',
      link: 'Подробнее',
      range: initialDates
    });

    this.components.salesChart = new ColumnChart({
      label: 'Продажи',
      url: 'api/dashboard/sales',
      range: initialDates,
      formatHeading: (total) => formatter.format(total)
    });

    this.components.customersChart = new ColumnChart({
      label: 'Клиенты',
      url: 'api/dashboard/customers',
      range: initialDates
    });

    this.components.sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      infinite: true,
      sorted: {
        id: 'sales',
        order: 'desc'
      },
      isSortLocally: true,
      range: [initialDates.from, initialDates.to]
    });
  }

  async loadData(from, to) {
    ['ordersChart', 'salesChart', 'customersChart'].forEach(chartName => {
      this.components[chartName].update(from, to);
    });

    return this.components.sortableTable.loadTableData({ from, to });
  }

  get template() {
    return `<div class='dashboard'>
    <div class='content__top-panel'>
    <h2 class='page-title'>Панель управления</h2>
    <div data-element='rangePicker'></div>
    </div>
      <div class='dashboard__charts'>
        <div data-element='ordersChart' class='dashboard__chart_orders'></div>
        <div data-element='salesChart' class='dashboard__chart_sales'></div>
        <div data-element='customersChart' class='dashboard__chart_customers'></div>
      </div>
            <h3 class='block-title'>Лидеры продаж</h3>
      <div data-element='sortableTable'>
      </div>
    </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async render() {
    this.createComponents();
    const container = document.createElement('div');

    container.innerHTML = this.template;
    this.element = container.firstElementChild;
    this.subElements = this.getSubElements();


    Object.keys(this.subElements).forEach(componentName => {
      this.subElements[componentName].append(this.components[componentName].element);
    });

    this.element.addEventListener('date-selected', this.onDateChange);
    return this.element;
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
  }
}
