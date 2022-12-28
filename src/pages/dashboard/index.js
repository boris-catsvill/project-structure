import BasicPage from '../basic-page';
import RangePicker from '../../components/range-picker';
import ColumnChart from '../../components/column-chart';
import SortableTable from '../../components/sortable-table';
import header from './bestsellers-header';
import { currencyFormat } from '../../utils/formatters';

/**
 * Dashboard page
 */
export default class extends BasicPage {

  initComponents() {
    const from = new Date();
    const to = new Date(from.getTime());
    from.setMonth(from.getMonth() - 1);

    const rangePicker = new RangePicker({ from, to });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: { from, to },
      label: 'Заказы',
      link: '/sales'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: { from, to },
      label: 'Продажи',
      formatHeading: value => currencyFormat(value)
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: { from, to },
      label: 'Клиенты'
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
      sorted: { id: 'sales', order: 'desc' },
      isSortLocally: true,
      enableLoading: false
    });

    this.components = { rangePicker, ordersChart, salesChart, customersChart, sortableTable };

    /* Обработчик изменения диапазона дат */
    this.dateHandler = event => {
      const { from, to } = event.detail;

      for (const chart of [ordersChart, salesChart, customersChart]) {
        chart.setRange(from, to);
      }

      sortableTable.url.searchParams.set('from', from.toISOString());
      sortableTable.url.searchParams.set('to', to.toISOString());
      sortableTable.fetchData();
    };
    document.addEventListener('date-select', this.dateHandler);
  }

  destroy() {
    document.removeEventListener('date-select', this.dateHandler);
    super.destroy();
  }

  getTemplate() {
    return `<div class='dashboard full-height flex-column'>
  <div class='content__top-panel'>
    <h2 class='page-title'>Главная панель</h2>
    <div data-element='rangePicker'><!-- RangePicker --></div>
  </div>

  <div data-element='chartsRoot' class='dashboard__charts'>
    <div data-element='ordersChart' class='dashboard__chart_orders'><!-- ColumnChart --></div>
    <div data-element='salesChart' class='dashboard__chart_sales'><!-- ColumnChart --></div>
    <div data-element='customersChart' class='dashboard__chart_customers'><!-- ColumnChart --></div>
  </div>

  <h3 class='block-title'>Лидеры продаж</h3>
  <div data-element='sortableTable'><!-- SortableTable --></div>
</div>`;
  }
}
