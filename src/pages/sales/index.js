import RangePicker from '../../components/range-picker/index.js';
import header from './sales-header.js';
import SortableTable from '../../components/sortable-table/index.js';

export default class Page {
    element;
    subElements;
    components;
  
    onRangeSelected = (event) => {
      const { from, to } = event.detail;
      this.updateComponents(from.toISOString(), to.toISOString());
    }
  
    constructor() {}
  
    get template() {
      return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="sortableTable" class="full-height flex-column">
        </div>
      </div>`;  
    }
  
    getRange() {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));
      const toISO = to.toISOString();
      const fromISO = from.toISOString();
  
      return { from, to, fromISO, toISO };
    }
  
    createComponents() {
      const {from, to, fromISO, toISO} = this.getRange();
  
      const rangePicker = new RangePicker({
        from,
        to
      });
  
      const sortableTable = new SortableTable(header, {
        url: 'api/rest/orders',
        sorted: {id: 'createdAt', order: 'desc'},
        isRowsClickable : false,
        urlSettings: {
          createdAt_gte: fromISO,
          createdAt_lte: toISO
        }
      });
      this.components = {rangePicker, sortableTable};
    }
  
    addComponents() {
      Object.entries(this.components).map(([componentName, component]) => {
        this.subElements[componentName].append(component.element);
    });
    }
  
    updateComponents(from, to) {
      this.components.sortableTable.update({createdAt_gte: from, createdAt_lte: to});
    }
  
    async render() {
      const element = document.createElement('div');
      element.innerHTML = this.template;
      this.element = element.firstElementChild;
  
      this.subElements = this.getSubElements();
      this.createComponents();
      this.initEventListeners();
      this.addComponents();
  
      return this.element;
    }
  
    initEventListeners() {
      this.components.rangePicker.element.addEventListener('date-select', this.onRangeSelected);
    }
  
    getSubElements() {
      const result = {};
      const elements = this.element.querySelectorAll("[data-element]");
  
      for (const subElement of elements) {
        const name = subElement.dataset.element;
        result[name] = subElement;
      }
  
      return result;
    }
  
    remove() {
      if (this.element) {
        this.element.remove();
      }
    }
  
    destroy() {
      this.components.rangePicker.element.removeEventListener('date-select', this.onRangeSelected);
      Object.values(this.components).map(component => component.destroy());
      this.remove();
    }
  }