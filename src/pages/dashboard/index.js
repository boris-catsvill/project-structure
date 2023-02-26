import RangePicker from "../../components/range-picker/index.js";
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from "./bestsellers-header.js";

//import fetchJson from "../../utils/fetch-json.js";
//const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {

  onDateSelect = (event) => {
      const {from, to} = event.detail;

      this.ordersChart.update(from, to);
      this.salesChart.update(from, to);
      this.customersChart.update(from, to);
      this.sortableTable.setFilter({from : from.toISOString(), to: to.toISOString()});
    }

  async initComponents() {
    const getRange = () => {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));

      return { from, to };
    };

    const { from, to } = getRange();

    this.rangePicker = new RangePicker({ from, to });
    this.ordersChart = new ColumnChart({
      url: "api/dashboard/orders",
      range: {
        from,
        to,
      },
      label: "orders",
      link: "#",
    });
    this.salesChart = new ColumnChart({
      url: "api/dashboard/sales",
      range: {
        from,
        to,
      },
      label: "sales",
      formatHeading: (data) => `$${data}`,
    });
    this.customersChart = new ColumnChart({
      url: "api/dashboard/customers",
      range: {
        from,
        to,
      },
      label: "customers",
    });
    this.sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      sorted: { id:'title', order: 'asc'},
      isSortLocally:true,
      step: 30,
      start: 0,
      filter: {from : from.toISOString(), to: to.toISOString()},
      linked: '/product/',
    });
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    await this.initComponents()

    this.subElements.rangePicker.append(this.rangePicker.element);
    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);
    this.subElements.productsContainer.append(this.sortableTable.element);

    this.initEventListeners();

    return this.element;
  }

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

            <div data-element="productsContainer" class="products-list__container full-height flex-column">
            </div>
        </div>
        `;
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
     this.element.addEventListener('date-select', this.onDateSelect);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.removeEventListener('date-select', this.onDateSelect);
    this.rangePicker.destroy();
    this.ordersChart.destroy();
    this.salesChart.destroy();
    this.customersChart.destroy();
    this.sortableTable.destroy();
    this.remove();
  }
}