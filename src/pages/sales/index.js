import BasePage from '../base-page/index.js';
import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import Notification from '../../components/notification/index.js';
import { NOTIFICATION_TYPE, ORDERS_REST_URL } from '../../constants/index.js';
import header from './sales-header.js';

export default class Page extends BasePage {
  onDateSelect = event => {
    this.updateComponents({
      createdAt_gte: new Date(event.detail.from).toISOString(),
      createdAt_lte: new Date(event.detail.to).toISOString()
    });
  }

  constructor(path) {
    super(path);
  }

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect);
  }

  get template() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="sortableTable" class="full-height flex-column"></div>
      </div>
    `;
  }

  async getComponents() {
    const today = new Date();

    const to = new Date(today);
    const from = new Date(today.setMonth(today.getMonth() - 1));

    const rangePicker = new RangePicker({from, to});

    const sortableTable = new SortableTable(header, {
      url: `${ORDERS_REST_URL}?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    });

    return {
      rangePicker,
      sortableTable
    };
  }

  async updateComponents(searchParams = {}) {
    this.components.sortableTable.update(searchParams)
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }
}
