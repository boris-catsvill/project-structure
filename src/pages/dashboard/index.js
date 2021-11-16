import RangePicker from '@/components/range-picker/index.js';
import SortableTable from '@/components/sortable-table/index.js';
import ColumnChart from '@/components/column-chart/index.js';
import header from '@/pages/dashboard/bestsellers-header.js';

import fetchJson from '@/utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  urlBestsellers = 'api/dashboard/bestsellers';

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);

    this.initComponent();
    this.renderComponent();
    this.initEventListeners();

    return this.element;
  }

  get template() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>

        <div class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable" class="full-height"></div>
      </div>
    `;
  }

  initComponent() {
    const now = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const to = new Date();

    const rangePicker = new RangePicker({ from, to });
    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: { from, to },
      label: 'orders',
      link: '#'
    });
    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: { from, to },
      label: 'sales',
      formatHeading: data => `$${parseFloat(data).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    });
    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: { from, to },
      label: 'customers',
    });
    const sortableTable = new SortableTable(header, {
      url: `${this.urlBestsellers}?from=${from.toISOString()}&to=${to.toISOString()}&_start=0&end=30`,
      isSortLocally: true,
      getTemplateBodyRow: (item, cells) => `<a href="/products/${item.id}" class="sortable-table__row">${cells}</a>`
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  renderComponent() {
    for (const [key, component] of Object.entries(this.components)) {
      this.subElements[key].append(component.element);
    }
  }

  async updateComponents(from, to) {
    const data = await this.loadBestsellers(from, to);

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
    this.components.sortableTable.update(data);
  }

  loadBestsellers(from, to) {
    const url = new URL(this.urlBestsellers, process.env.BACKEND_URL);

    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('_start', '0');
    url.searchParams.set('_end', '30');
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());

    return fetchJson(url);
  }

  destroyComponents() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.destroyComponents();
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
