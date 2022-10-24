import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  element;
  subElements = {};

  range = {
    to: new Date(),
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  };

  async fetchSortableTableData(
    from = "from",
    to = "to",
    id = "title",
    order = "asc",
    start = 1,
    end = 20
  ) {
    const pathNameURL = `${process.env.BACKEND_URL}api/dashboard/bestsellers`;
    const fetchURL = new URL(pathNameURL);

    fetchURL.searchParams.set("from", from.toISOString());
    fetchURL.searchParams.set("to", to.toISOString());
    fetchURL.searchParams.set("_sort", id);
    fetchURL.searchParams.set("_order", order);
    fetchURL.searchParams.set("_start", start);
    fetchURL.searchParams.set("_end", end);

    try {
      const response = await fetch(fetchURL.toString());
      const data = await response.json();

      this.element.classList.remove("sortable-table_loading");

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  initListeners() {
    this.element.addEventListener("date-select", this.onDateSelect);
  }

  removeListeners() {
    this.element.removeEventListener("date-select", this.onDateSelect);
  }

  onDateSelect = async (event) => {
    const progressBar = document.querySelector(".progress-bar");
    progressBar.style.display = "block";

    const { from, to } = event.detail;
    console.log(event.detail);

    this.getChartsUpdate(from, to);
    this.getSortableTableUpdate(from, to);

    progressBar.style.display = "none";
  };

  getChartsUpdate(from, to) {
    this.ordersChartElement.update(from, to);
    this.salesChartElement.update(from, to);
    this.customersChartElement.update(from, to);
  }

  async getSortableTableUpdate(from, to) {
    const data = await this.fetchSortableTableData(from, to);
    this.sortableTableElement.renderRows(data);
  }

  get dashboardPageTemplate() {
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

  async getRangePicker() {
    const { rangePicker } = this.subElements;

    this.rangePickerElement = new RangePicker(this.range);

    rangePicker.append(this.rangePickerElement.element);
  }

  async getSortableTable() {
    const { sortableTable } = this.subElements;
    const { from, to } = this.range;

    this.sortableTableElement = new SortableTable(header, {
      url: "api/dashboard/bestsellers",
    });

    this.getSortableTableUpdate(from, to);

    sortableTable.append(this.sortableTableElement.element);
  }

  async getColumnChart() {
    const { ordersChart, salesChart, customersChart } = this.subElements;

    this.ordersChartElement = new ColumnChart({
      url: `${process.env.BACKEND_URL}api/dashboard/orders`,
      range: this.range,
      label: "orders",
      link: "#",
    });

    this.salesChartElement = new ColumnChart({
      url: `${process.env.BACKEND_URL}api/dashboard/sales`,
      range: this.range,
      label: "sales",
      formatHeading: (data) => `$${data}`,
    });

    this.customersChartElement = new ColumnChart({
      url: `${process.env.BACKEND_URL}api/dashboard/customers`,
      range: this.range,
      label: "customers",
    });

    ordersChart.append(this.ordersChartElement.element);
    salesChart.append(this.salesChartElement.element);
    customersChart.append(this.customersChartElement.element);
  }

  async render() {
    const element = document.createElement("div");

    element.innerHTML = this.dashboardPageTemplate;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initListeners();
    // TODO: change await to Promise
    await this.getColumnChart();
    await this.getRangePicker();
    await this.getSortableTable();

    const progressBar = document.querySelector(".progress-bar");
    progressBar.style.display = "none";
    return this.element;
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

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.removeListeners();
  }

  destroy() {
    this.element.remove();
    this.removeListeners();
  }
}
