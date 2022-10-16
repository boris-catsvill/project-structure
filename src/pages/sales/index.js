import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';
import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    await this.createComponents();
    this.initComponents();
    this.initEventListeners();
    return this.element;
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }
    return subElements;
  }

  getTemplate() {
    return `
    <div class="sales full-height flex-column">
      <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <div data-element="rangePicker"></div>
      </div>
      <div class="sales__sortable" data-element="sortableTable">
      </div>
    </div>
    `;
  }

  async createComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const picker = new RangePicker({
      from,
      to
    });

    const sortableUrl = new URL('api/rest/orders', process.env.BACKEND_URL);
    sortableUrl.searchParams.set('createdAt_gte', from.toISOString());
    sortableUrl.searchParams.set('createdAt_lte', to.toISOString());

    const sortable = new SortableTable(header, {
      product: false,
      url: sortableUrl
    });

    this.sortableUrl = new URL(sortable.url);

    this.components.rangePicker = picker;
    this.components.sortableTable = sortable;
  }

  initComponents() {
    Object.entries(this.components).forEach(([key, value]) => {
      if (this.subElements[key]) {
        this.subElements[key].append(value.element);
      }
    });
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.update(from, to);
    });
  }

  async update(from, to) {
    const data = await this.fetchData(from, to);
    const { sortableTable } = this.components;
    if (data.length) {
      sortableTable.element.classList.remove('sortable-table_empty');
      sortableTable.update(data);
      return;
    }
    sortableTable.element.classList.add('sortable-table_empty');
  }

  fetchData(from, to) {
    this.sortableUrl.searchParams.set('createdAt_gte', from.toISOString());
    this.sortableUrl.searchParams.set('createdAt_lte', to.toISOString());

    return fetchJson(this.sortableUrl);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
    this.sortableUrl = null;
    Object.values(this.components).forEach(item => item.destroy());
    this.components = {};
  }
}
