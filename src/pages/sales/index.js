import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js'
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async updateTableComponent (from, to) {
   const data = await fetchJson(`/api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`);
   this.components.sortableTable.update(data);
  }

  async initComponents () {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable(header, {
      url: `/api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`,
      isSortLocally: false
    });

    this.components = {
      sortableTable,
      rangePicker,
    }
  }

  get template () {
    return `<div class="sales full-height flex-column">
      <div class="content__top-panel">
        <h1 class="page-title">Sales</h1>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>

      <div data-elem="ordersContainer" class="full-height flex-column">
        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    </div>`;
  }

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
     // this.updateChartsComponents(from, to);
     this.updateTableComponent(from, to);
    });
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
