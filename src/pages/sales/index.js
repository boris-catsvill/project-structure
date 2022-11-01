import fetchJson from '../../utils/fetch-json'
import SortableTable from '../../components/sortable-table';
import RangePicker from '../../components/range-picker';
import header from './sales-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getHeaderTemplate();

    this.element = wrapper.firstElementChild;
    this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.addEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    for (const item of elements) {
      this.subElements[item.dataset.elem] = item;
    }
  }

  getHeaderTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
            <h1 class="page-title">Sales</h1>
            <div data-elem="rangepickerContainer" class="rangepicker"></div>
        </div>
        <div data-elem="ordersContainer" class="full-height flex-column"></div>
      </div>
    `
  }

  initComponents() {

    const to = new Date();
    const from = new Date(2022, 8, 1, 1, 1, 1, 1);

    this.components.sortableTable = new SortableTable(header, {
      url: 'api/rest/orders',
      isSortedLocally: false,
      type: 'sales',
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    });

    this.components.sortableTable.url.searchParams.delete('_embed');
    this.components.sortableTable.url.searchParams.set('createdAt_gte', from.toISOString());
    this.components.sortableTable.url.searchParams.set('createdAt_lte', to.toISOString());

    this.components.rangePicker = new RangePicker({from, to});
  };

   renderComponents() {
    this.subElements.ordersContainer.append(this.components.sortableTable.element);
    this.subElements.rangepickerContainer.append(this.components.rangePicker.element);
  }

  async updateTable(from, to) {
    this.components.sortableTable.url.searchParams.set('createdAt_gte', from.toISOString());
    this.components.sortableTable.url.searchParams.set('createdAt_lte', to.toISOString());
    this.components.sortableTable.data = [];

    const data = await fetchJson(this.components.sortableTable.url);
    this.components.sortableTable.addDataToTable(data);
  }

   dateSelectHandler = async event => {
    const {from, to} = event.detail;
    await this.updateTable(from, to);
  }

  addEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => this.dateSelectHandler(event));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    Object.values(this.components).forEach(item => item.destroy());
  }
}
