import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';
import PageComponent from '../page';

export default class Page extends PageComponent {
  get template() {
    return `
      <div class='dashboard full-height flex-column'>
        <div class='content__top-panel'>
          <h2 class='page-title'>Панель управления</h2>
          <div data-element='rangePicker'></div>
        </div>
        <div data-element='chartsRoot' class='dashboard__charts'>
          <div data-element='ordersChart' class='dashboard__chart_orders'></div>
          <div data-element='salesChart' class='dashboard__chart_sales'></div>
          <div data-element='customersChart' class='dashboard__chart_customers'></div>
        </div>
      
        <h3 class='block-title'>Лидеры продаж</h3>
      
        <div data-element='sortableTable'></div>
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
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());

    const dashboardUrl = `${this.backendUrl}/api/dashboard`;

    const rangePicker = new RangePicker({ from, to });

    const ordersChart = new ColumnChart({
      url: `${dashboardUrl}/orders`,
      label: 'Заказы',
      link: '/sales',
      range: { from, to }
    });

    const salesChart = new ColumnChart({
      url: `${dashboardUrl}/sales`,
      label: 'Продажи',
      formatHeading: (data) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data),
      range: { from, to }
    });

    const customersChart = new ColumnChart({
      url: `${dashboardUrl}/customers`,
      label: 'Клиенты',
      range: { from, to }
    });

    const sortableTable = new SortableTable(header, {
      url: `${dashboardUrl}/bestsellers`,
      isSortLocally: true,
      sorted: {
        from, to,
        id: 'title',
        order: 'asc'
      }
    });

    this.components.rangePicker = rangePicker;
    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;
    this.components.sortableTable = sortableTable;
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      this.from = event.detail.from;
      this.to = event.detail.to;
      this.update();
    });
  }

  update() {
    this.components.ordersChart.update(this.from, this.to);
    this.components.salesChart.update(this.from, this.to);
    this.components.customersChart.update(this.from, this.to);
    this.components.sortableTable.update({
      id: 'title',
      order: 'asc',
      from: this.from,
      to: this.to
    });
  }
}
