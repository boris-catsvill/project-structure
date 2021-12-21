import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};

  onDateSelect = async event => {
    const { from, to } = event.detail;
    this.from = from;
    this.to = to;
    this.components.sortableTable.url.searchParams.set('createdAt_gte', from.toISOString());
    this.components.sortableTable.url.searchParams.set('createdAt_lte', to.toISOString());

    this.components.sortableTable.sortOnServer(
      this.components.sortableTable.sorted.id,
      this.components.sortableTable.sorted.order,
      this.components.sortableTable.start,
      this.components.sortableTable.end);
  };

  constructor() {
    const today = new Date();
    this.timeOffset = today.getTimezoneOffset();
    today.setMinutes(today.getMinutes() + this.timeOffset);
    this.from = new Date(today.setMonth(today.getMonth() - 1));
    this.to = new Date();
    this.components.rangePicker = new RangePicker({
      from: this.from,
      to: this.to
    });

    const url = new URL('api/rest/orders', BACKEND_URL);
    url.searchParams.set('createdAt_gte', this.from.toISOString());
    url.searchParams.set('createdAt_lte', this.to.toISOString());
    this.components.sortableTable = new SortableTable(header, {
      url: url.toString(),
      sorted: {
        id: 'createdAt',
        order: 'desc'
      },
      step: 30,
      start: 0,
      end: 30
    });
  }

  get template() {
    return `<div class="dashboard full-height flex-column">
    <div class="content__top-panel">
      <h2 class="page-title">Продажи</h2>
    </div>
    <div data-elem="ordersContainer" class="full-height flex-column">
    </div>
    </div>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements.topPanel = element.querySelector('.content__top-panel');

    this.subElements.topPanel.append(this.components.rangePicker.element);
    this.subElements.rangePicker = element.querySelector('.rangepicker');

    this.subElements.ordersContainer = element.querySelector('[data-elem="ordersContainer"]');

    this.subElements.ordersContainer.append(this.components.sortableTable.element);
    this.subElements.sortableTable = this.subElements.ordersContainer.querySelector('.sortable-table');

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      if (component.destroy instanceof Function) {
        component.destroy();
      }
    }

    this.remove();
    this.element = null;
  }
}
