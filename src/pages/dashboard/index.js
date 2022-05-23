import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    subElements = {};
    components = {};
    urlBestaSellers = new URL('api/dashboard/bestsellers', BACKEND_URL);


    render () {

      const element = document.createElement('div');
      element.innerHTML = this.getTemplate();

      this.element = element.firstElementChild;

      this.subElements = this.getSubElements();

      this.initComponents();
      this.renderComponents();
      this.initEventListeners();
    
      return this.element;
    }

    initComponents() {

      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth(), now.getDay()));

      const rangePicker = new RangePicker();

      const sortableTable = new SortableTable(header, {
        isSortLocally: false,
        url: `api/dashboard/bestsellers?from=${from}&to=${to}&_sort=title&_order=asc&_start=0&_end=30`
      });


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
        formatHeading: data => `$${data}`
      });

      const customersChart = new ColumnChart({
        url: 'api/dashboard/customers',
        range: {
          from,
          to
        },
        label: 'customers',
      });


      this.components = {
        rangePicker,
        ordersChart,
        salesChart,
        customersChart,
        sortableTable,
      };
    }

    renderComponents() {
      Object.keys(this.components).forEach(component => {
        const root = this.subElements[component];
        const { element } = this.components[component];
        root.append(element);
      });

      this.toggleProgressbar();
    }

    toggleProgressbar() {
      const element = document.querySelector('.progress-bar');
      return element.style.display === '' ? element.style.display = 'none' : element.style.display = 'none';
    }

    initEventListeners() {

      document.addEventListener('date-select', async event => {
        this.toggleProgressbar();
        const { from, to } = event.detail;

        const columnChartComponents = [
          this.components.ordersChart,
          this.components.salesChart,
          this.components.customersChart,
        ];

        for (const component of columnChartComponents) {
          component.loadData(from, to);
        }

        const data = await this.loadData(from, to);
        this.components.sortableTable.update(data);
        this.toggleProgressbar();
      });
    }

    async loadData(from, to) {
      this.urlBestaSellers.searchParams.set('_start', '1');
      this.urlBestaSellers.searchParams.set('_end', '21');
      this.urlBestaSellers.searchParams.set('_sort', 'title');
      this.urlBestaSellers.searchParams.set('_order', 'asc');
      this.urlBestaSellers.searchParams.set('from', from.toISOString());
      this.urlBestaSellers.searchParams.set('to', to.toISOString());

      const data = await fetchJson(this.urlBestaSellers);
      return data;
    }

    getSubElements() {
      const elements = this.element.querySelectorAll('[data-element]');

      for (const item of elements) {
        this.subElements[item.dataset.element] = item;
      }
      
      return this.subElements;
    }


    remove() {
      if (this.element) {
        this.element.remove();
      }
    }

    destroy() {
      this.remove();
      this.element = null;
      this.subElements = null;

      for (const component of Object.values(this.components)) {
        component.destroy();
      }
    }


    getTemplate() {
      return `
        <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker">
          <!-- range picker -->
          </div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <!-- column chart components -->
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable">
          <!-- sort table component -->
        </div>
      </div>
            `;
    }

}
