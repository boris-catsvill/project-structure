import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from "./sales-header.js";

export default class Page {
  components = {};
  subElements = {};

  handlerDateSelect = event => {
    const { from, to } = event.detail;

    // noinspection JSIgnoredPromiseFromCall
    this.updateComponents(from, to);
  };

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const components = this.initComponents();
    this.renderComponents(components);
    this.components = components;

    this.addEventListeners();

    return this.element;
  }

  initComponents() {
    const date = new Date();
    const period = {
      from: new Date(date.setMonth(date.getMonth() - 1)),
      to: new Date()
    };

    this.urlOrders =  new URL('/api/rest/orders', process.env.BACKEND_URL);
    this.urlOrders.searchParams.set('createdAt_gte', period.from.toISOString());
    this.urlOrders.searchParams.set('createdAt_lte', period.to.toISOString());

    // Компоненты
    const rangePicker = new RangePicker(period);

    const sortableTable = new SortableTable(header, {
      url: this.urlOrders,
      isSortLocally: false,
      isInfinityScroll: true,
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

  renderComponents(components) {
    const keysComponents = Object.keys(components);

    keysComponents.forEach(component => {
      const root = this.subElements[component];
      const { element } = components[component];

      root.append(element);
    });
  }

  async updateComponents(from, to) {
    const { sortableTable } = this.components;

    this.urlOrders.searchParams.set('createdAt_gte', from.toISOString());
    this.urlOrders.searchParams.set('createdAt_lte', to.toISOString());

    sortableTable.update(this.urlOrders);
  }

  addEventListeners() {
    const { rangePicker } = this.components;

    rangePicker.element.addEventListener('date-select', this.handlerDateSelect);
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

  getTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Продажи</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
