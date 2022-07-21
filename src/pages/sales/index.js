import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-headers.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
  element;
  subElements = {};
  pageComponents = {};
  url = new URL('/api/dashboard/bestsellers', BACKEND_URL);

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderPageComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?_sort=createdAt&_order=asc&_start=${from.toISOString()}&_end=${to.toISOString()}`,
      isSortLocally: false
    });

    this.pageComponents.rangePicker = rangePicker;
    this.pageComponents.sortableTable = sortableTable;
  }

  getTemplate() {
    return `
        <div class="sales full-height flex-column">
            <div class="content__top-panel">
                <h1 class="page-title">Sales</h1>
                <div data-element="rangePicker" class="rangePicker">
                    <!-- RangePicker component -->
                </div>
            </div>
            <div data-elem="ordersContainer" class="full-height flex-column">
                <div data-element="sortableTable" class="sortable-table">
                    <!-- sortable-table component -->
                </div>
            </div>
        </div>
        `;
  }

  renderPageComponents() {
    Object.keys(this.pageComponents).forEach(pageComponent => {
      const pagePlace = this.subElements[pageComponent];

      pagePlace.append(this.pageComponents[pageComponent]['element']);
    });
  }

  async updateComponent(from, to) {
    const data = await this.loadData(from, to);

    this.pageComponents.sortableTable.update(data);
  }

  loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    this.url.searchParams.set('_sort', 'createdAt');
    this.url.searchParams.set('_order', 'desc');
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');

    return fetchJson(this.url);
  }

  initEventListeners() {
    this.pageComponents.rangePicker.element.addEventListener('date-select', async event => {
      const { from, to } = event.detail;
      await this.updateComponent(from, to);
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

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
    this.element = null;
    this.subElements = {};

    for (const component of Object.values(this.component)) {
      component.destroy();
    }

    this.component = {};
  }
}
