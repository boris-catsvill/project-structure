import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  element;
  subElements;
  charts = [];
  rangePicker;

  getTemplate() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }

  async render() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    this.rangePicker = new RangePicker({from, to});
    const [
      sortableTable,
      columnChartOrders,
      columnChartSales,
      columnChartCustomers
    ] = await this.getSubComponentsAsync();
    this.charts = [columnChartOrders, columnChartSales, columnChartCustomers];
    await sortableTable.render();

    const pageWrapper = document.createElement("div");
    pageWrapper.innerHTML = this.getTemplate();
    this.element = pageWrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.subElements.rangePicker.append(this.rangePicker.element);
    this.subElements.sortableTable.append(sortableTable.element);
    this.subElements.ordersChart.append(columnChartOrders.element);
    this.subElements.salesChart.append(columnChartSales.element);
    this.subElements.customersChart.append(columnChartCustomers.element);
    this.initEventListeners();

    return this.element;
  }

  getSubComponentsAsync() {
    return Promise.all([
      new SortableTable(
        header,
        {
          url: "api/dashboard/bestsellers",
          isSortLocally: true
        }
      ),
      new ColumnChart({
        url: "api/dashboard/orders",
        range: this.rangePicker.selected
      }),
      new ColumnChart({
        url: "api/dashboard/sales",
        range: this.rangePicker.selected
      }),
      new ColumnChart({
        url: "api/dashboard/customers",
        range: this.rangePicker.selected
      })]
    );
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  initEventListeners() {
    this.subElements.rangePicker.addEventListener("date-select", (event) => this.updatePage(event.detail));
  }

  updatePage(range) {
    this.charts.forEach(chart => chart.loadData(range.from, range.to));
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.charts.forEach(chart => chart.destroy());
    this.rangePicker.destroy();
  }
}
