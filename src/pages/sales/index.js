import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sellers-header.js';

export default class Page{
  element;
  subElements = {};
  components = {};

  // events
  evntSignal = new AbortController();
  
  async updateTableComponent (from, to) {
    const  dateParams = {
        'createdAt_gte': from.toISOString(),
	    'createdAt_lte': to.toISOString()
    }

    this.components.sortableTable.setFilter(dateParams);
    await this.components.sortableTable.refresh(true);
  }


  async initComponents () {
    const to = new Date();
    const from = new Date(to);
    from.setMonth(from.getMonth() - 1);

    const rangePicker = new RangePicker({ from, to });

    const dateParams = {
        'createdAt_gte': from.toISOString(),
	    'createdAt_lte': to.toISOString()
    }    
    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders`,
      isSortLocally: false
    }, dateParams);
    this.components.sortableTable = sortableTable;
    this.components.rangePicker = rangePicker;
  }

  get template () {
    return `<div class="sales">
      <div class="content__top-panel">
        <h2 class="page-title">Sales</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
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
      this.updateTableComponent(from, to);
    });      
  }
  
  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
  
  destroy () {
    this.remove();
    if (this.evntSignal) {
      this.evntSignal.abort();
    }       
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }  
}
  