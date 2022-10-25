import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/rest/orders', BACKEND_URL);

  async updateComponents (from, to) {
    const data = await this.loadData(from, to);
    const sortableTableURL = this.components.sortableTable.url;

    this.element.querySelector('.sortable-table__body').innerHTML = '';

    sortableTableURL.searchParams.set('createdAt_gte', from.toISOString());
    sortableTableURL.searchParams.set('createdAt_lte', to.toISOString());

    this.components.sortableTable.update(data);
  }


  async loadData(from, to) {
    this.url.searchParams.set('createdAt_gte', from.toISOString());
    this.url.searchParams.set('createdAt_lte', to.toISOString());
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('_sort', 'createdAt');
    this.url.searchParams.set('_order', 'desc');

    const data = await fetchJson(this.url);

    return data;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }


  getTemplate(){
    return `
    <div class="sales full-height flex-column">
      <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <div data-element="rangePicker" class="rangepicker"></div>
      </div>
      <div data-element="sortableTable" class="full-height flex-column"></div>
    </div>
    `
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    })
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    })

    const sortableTable = new SortableTable(header, {
      sorted: {
        id: 'createdAt',
        order: 'desc'
      },
      url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      isRowTypeLink: false,
    })

    this.components = {
      sortableTable,
      rangePicker
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

      this.components.sortableTable.stopFetching = false;
      this.updateComponents(from, to);
    });
  }

  destroy () {
    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
}
