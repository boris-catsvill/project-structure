import { findSubElements } from '../../utils/find-sub-elements';
import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import header from './header';

const pageTitle = 'Продажи';
const ORDERS_URL = '/api/rest/orders';


export default class SalesPage {
  element;
  now = new Date();
  range = {
    createdAt_gte: new Date(this.now.setMonth(this.now.getMonth() - 1)),
    createdAt_lte: new Date()
  };
  subElements = {
    topPanel: void 0,
    ordersContainer: void 0
  };

  getTemplate = () => `
  <div class='sales full-height flex-column'>
  <div class='content__top-panel'>
    <h1 class='page-title'>${pageTitle}</h1>
    <div data-element='rangePicker'></div>
  </div>
  <div class='full-height flex-column'>
    <div data-element='sortableTable'></div>
  </div>
</div>
  `;

  createRangePicker = () => (new RangePicker(this.range));
  createSalesTable = async () => new SortableTable(header, { url: ORDERS_URL, range: this.range });

  updateComponents = (range) => {
    this.sortableTable.update(range);
  };

  initSubElements = async () => {
    this.subElements = findSubElements(this.element);
    this.rangePicker = this.createRangePicker();
    this.sortableTable = await this.createSalesTable();

    this.subElements.rangePicker.append(this.rangePicker.element);
    this.subElements.sortableTable.append(this.sortableTable.element);
  };

  render = async () => {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    await this.initSubElements();
    this.addEventListeners();
    return this.element;
  };
  addEventListeners = () => {
    this.element.addEventListener('date-select', ({ detail }) => {
      this.range = detail;
      this.subElements = {};
      this.updateComponents({ createdAt_gte: detail.from, createdAt_lte: detail.to });
    });
  };

  remove = () => {
    this.element.remove();
  };
  destroy = () => {
    this.remove();
    this.subElements = {};
    this.rangePicker.destroy();
    this.sortableTable.destroy();
  };
}
