import salesHeader from './sales-header.js';
import SortableTable from '../../components/sortable-table';
import RangePicker from '../../components/range-picker';
import fetchJson from '../../utils/fetch-json';

export default class Page {
  element;
  subElements;
  components = {};

  constructor() {
  }

  initComponents() {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));
    const rangePicker = new RangePicker({
      from,
      to
    });
    const ORDERS = `${process.env.BACKEND_URL}api/dashboard/orders?from=${from.toISOString()}&to=${to.toISOString()}`;
    const sortableTable = new SortableTable(salesHeader, {
      url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`,
      isSortLocally: true,
      tag : 'div'
    });
    this.components.ordersContainer = sortableTable;
    this.components.input = rangePicker;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
      root.append(element);
    });
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements();
    await this.initComponents();
    this.renderComponents();
    this.initEventListener();
    return element;
  }

  get template() {
    return `
    <div class='sales full-height flex-column'>
      <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <div class="rangepicker" data-elem="input"></div>
      </div>
      <div data-elem="ordersContainer" class="full-height flex-column">
        <div class="sortable-table">
          <div data-elem="header" class="sortable-table__header sortable-table__row"></div>
        </div>
      </div>
    </div>
`;
  }

  initEventListener() {
    this.components.input.element.addEventListener('date-select', this.updateTableComponent);
    const toggleSidebar = document.querySelector('.sidebar__toggler');
    this.toggleSidebar = toggleSidebar;
    this.toggleSidebar.addEventListener('click', this.togglerSidebar);
  }

  togglerSidebar() {
    document.body.classList.toggle("is-collapsed-sidebar")
  }

   updateTableComponent = async (event) => {
    const { from, to } = event.detail;
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/orders?createdAt_gte=${new Date(from).toISOString()}&createdAt_lte=${new Date(to).toISOString()}&_sort=createdAt&_order=desc&_start=1&_end=20`);
    this.components.ordersContainer.addRows(data);
  }


  getSubElements(element) {
    const elements = this.element.querySelectorAll('[data-elem]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    this.components.input.element.removeEventListener('date-select', this.updateTableComponent)
    this.toggleSidebar.removeEventListener('click', this.togglerSidebar);
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}