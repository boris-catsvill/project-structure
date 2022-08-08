import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js'; 
import header from './sales-header.js';

export default class Page {
  element;
  subElements = {};
  usedComponents = {};

  get template() {
    return `
    <div class="sales full-height flex-column">
        <div class="content__top-panel" data-element="rangePickerContainer">
            <h1 class="page-title">Sales</h1>
        </div>
        <div data-element="ordersContainer" class="full-height flex-column">
        </div>
    </div>`;
  }

  fillSubElements() {
    const allDataElem = this.element.querySelectorAll("[data-element]");
    for (const element of allDataElem) {
      this.subElements[element.dataset.element] = element;
    }
  }

  onRangeChange = (event) => {
    const {
        from: createdAt_gte,
        to: createdAt_lte
      } = this.usedComponents.rangePicker.selected;
    this.usedComponents.sortableTable.range = {createdAt_gte: createdAt_gte, createdAt_lte: createdAt_lte};
    const {
      id, order
    } = this.usedComponents.sortableTable.sorted;
    const {
      start, end
    } = this.usedComponents.sortableTable;
    this.usedComponents.sortableTable.sortOnServer(id, order, start, end);

  }

  async render() {

    const wraper = document.createElement('div'); 
    wraper.innerHTML = this.template;
    this.element = wraper.firstElementChild;
    this.fillSubElements();

    const now = new Date();
    this.usedComponents.rangePicker = new RangePicker({to: new Date(), from: new Date(now.setMonth(now.getMonth() - 1))});
    this.usedComponents.rangePicker.element.addEventListener('date-select', this.onRangeChange);
    
    const {
        from: createdAt_gte,
        to: createdAt_lte
      } = this.usedComponents.rangePicker.selected;
    this.usedComponents.sortableTable = new SortableTable(header, {
      url: 'api/rest/orders',
      range: {createdAt_gte: createdAt_gte, createdAt_lte: createdAt_lte}
    });
    
    this.subElements['rangePickerContainer'].append(this.usedComponents.rangePicker.element);
    this.subElements['ordersContainer'].append(this.usedComponents.sortableTable.element);

    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove;
    }
    this.element = null;
  }

  destroy() {
    Object.values(this.usedComponents).forEach(value => {
      value.destroy();
    });
    this.remove();
    this.usedComponents = null;
    this.subElements = null;
  }

}
