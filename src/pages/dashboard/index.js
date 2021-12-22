import ColumnChart from '../../components/column-chart';
import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table';

import PageComponent from '../../utils/page.js';
import header from './bestsellers-header.js';

export default class Page extends PageComponent {
  url = new URL(`${process.env.BACKEND_URL}api/dashboard/bestsellers`);

  handleClearFilter = async () => {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const filter = { detail: { from, to }};

    await this.updateComponents(filter); 
  }

  get components() {
    return {
      columnChart: ColumnChart,
      rangePicker: RangePicker,
      sortableTable: SortableTable,
    };
  }

  get template() {
    return (
      `<div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <!-- column-chart components -->
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>`
    );
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const ColumnChart = this.getComponentByName('columnChart');
    const RangePicker = this.getComponentByName('rangePicker');
    const SortableTable = this.getComponentByName('sortableTable');
    
    const ordersChart = new ColumnChart({ 
      url: `api/dashboard/orders`, 
      range: { from, to },
      label: 'Заказы',
      link: 'sales'
    });

    const rangePicker = new RangePicker({ from, to });
    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: { from, to},
      label: 'Продажи',
      formatHeading: (it) => `$${String(it / 1000).replace('.', ',')}` 
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: { from, to },
      label: 'Клиенты',
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true,
      hasRowClicked: true
    });

    
    this.instanceComponents = {
      ordersChart,
      customersChart,
      salesChart,
      rangePicker,
      sortableTable
    };
  }

  updateComponents = async ({ detail }) => {
    const { from, to } = detail;
    const data = await this.loadData(detail);
    
    
    this.instanceComponents.sortableTable.update(data);
    this.instanceComponents.salesChart.update(from, to);
    this.instanceComponents.customersChart.update(from, to);
    this.instanceComponents.ordersChart.update(from, to);
  } 

  initEventListeners() {
    const rangePicker = this.instanceComponents['rangePicker'];
    rangePicker.element.addEventListener('date-select', this.updateComponents);
    this.element.addEventListener('clear-filter', this.handleClearFilter);
  }

  loadData ({from, to}) {
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '21');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return this.fetchJson(this.url);
  }
}
