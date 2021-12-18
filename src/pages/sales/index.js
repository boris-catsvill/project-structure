import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

export default class Page {
  subElements = {};
  components = {};
  defaultFrom = new Date();
  defaultTo = new Date();
  url;

  setDefaultRange() {
    const month = this.defaultTo.getMonth();
    this.defaultFrom.setMonth(month - 1);

    if (this.defaultFrom.getMonth() === month) {
      this.defaultFrom.setDate(0);
      this.defaultFrom.setHours(0, 0, 0, 0);
    }
  }

  getTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Sales</h1>
          <div data-element="rangePicker" class="rangepicker"></div>
        </div>
        <div class="full-height flex-column" data-element="ordersContainer">
          <div data-element="sortableTable" class="sortable-table"></div>
        </div>
      </div>
`
  }

  urlInitializer() {
    this.url = new URL('/api/rest/orders', process.env.BACKEND_URL);
    this.url.searchParams.set('createdAt_gte', this.defaultFrom.toISOString());
    this.url.searchParams.set('createdAt_lte', this.defaultTo.toISOString());
  }

  renderLinkItem(dataItem) {
    return `
      <div class="sortable-table__row">
        <div class="sortable-table__cell">${dataItem.id}</div>
        <div class="sortable-table__cell">${dataItem.user}</div>
        ${this.headerConfig.find(obj => obj.id === 'createdAt').template(dataItem.createdAt)}
        ${this.headerConfig.find(obj => obj.id === 'totalCost').template(dataItem.totalCost)}
        <div class="sortable-table__cell">${dataItem.delivery}</div>
      </div>
      `
  }

  initialize() {
    this.urlInitializer();

    this.components = {
      rangePicker: new RangePicker({ from: this.defaultFrom, to: this.defaultTo }),
      sortableTable: new SortableTable(header, {
        url: this.url,
        sorted: {
          order: 'desc',
          id: 'createdAt'
        },
        renderLinkItem: this.renderLinkItem,
      })
    }

    this.renderComponents();
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.setDefaultRange();
    this.subElements = this.getSubElements(this.element);
    this.initialize();
    this.attachEventListeners();
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accumulator, subElement) => {
      accumulator[subElement.dataset.element] = subElement;
      return accumulator;
    }, {})
  }

  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const container = this.subElements[component];
      const { element } = this.components[component];
      container.append(element);
    })
  }

  async updateComponents(range) {
    this.url.searchParams.set('createdAt_gte', range.detail.from.toISOString());
    this.url.searchParams.set('createdAt_lte', range.detail.to.toISOString());

    this.components.sortableTable.sortOnServer({
      updatedURL: this.url
    })
  }

  dateSelectHandler = (event) => {
    this.updateComponents(event);
  }

  attachEventListeners() {
    document.addEventListener('date-select', this.dateSelectHandler);
  }

  removeListeners() {
    document.removeEventListener('date-select', this.dateSelectHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeListeners();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
    this.subElements = {};
  }
}
