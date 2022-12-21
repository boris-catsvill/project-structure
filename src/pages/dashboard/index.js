import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';


export default class Page {
  render() {
    const element = document.createElement("div"); // (*)
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    this.rangePicker = rangePicker;

    this.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      },
      label: 'orders',
      link: '#'
    });
    this.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });
    this.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'customers',
    });

    this.sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    });

    this.subElements.rangePicker.append(rangePicker.element);

    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);

    this.subElements.sortableTable.append(this.sortableTable.element);


    this.initEventListeners();
    return this.element;
  }

  async update(from, to) {
    await this.ordersChart.update(from, to);
    await this.salesChart.update(from, to);
    await this.customersChart.update(from, to);

    const url = new URL('api/dashboard/bestsellers', BACKEND_URL);
    url.searchParams.set('_start', '1');
    url.searchParams.set('_end', '21');
    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());

    let sortableTableUrl = `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`;
    this.sortableTable.url = new URL(sortableTableUrl, 'https://course-js.javascript.ru');
    await this.sortableTable.reRenderBody();

  }

  initEventListeners () {
    this.subElements.rangePicker.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.update(from, to);
    });
  }

  getTemplate() {
    return `
    <div class="dashboard">
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

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }
  get subElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.sortableTable.destroy();
    this.ordersChart.destroy();
    this.salesChart.destroy();
    this.customersChart.destroy();
    this.rangePicker.destroy();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
