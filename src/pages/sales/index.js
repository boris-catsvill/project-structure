/* eslint-disable no-undef */
import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

export default class Page {
  element;
  components = {};
  subElements = {};

  onDateSelect = ({ detail }) => {
    this.updateComponents(detail);
  }

  get template() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <!-- Range Picker -->
        </div>
        <div data-elem="ordersContainer" class="full-height flex-column orders-list">
          <!-- Table -->
        </div>
      </div>
    `;
  }

  initComponents() {
    this.initRangePicker();
    this.initTable();

    Object.entries(this.components).forEach(([key, value]) => this.subElements[key] = value.element);
  }

  renderComponents() {
    this.element.querySelector('.content__top-panel').append(this.subElements['rangePicker']);
    this.element.querySelector('[data-elem=ordersContainer]').append(this.subElements['sortableTable']);
  }

  updateComponents({ from, to }) {
    const tableComponent = this.components['sortableTable'];
    tableComponent.url.searchParams.set('createdAt_gte', from.toISOString());
    tableComponent.url.searchParams.set('createdAt_lte', to.toISOString());
    tableComponent.loadData().then(data => tableComponent.update(data));
  }

  render() {
    this.element = this.getElementFromTemplate(this.template);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  initRangePicker() {
    const from = new Date();
    const to = new Date();
    from.setMonth(to.getMonth() - 1);
    from.setDate(to.getDate() + 1);
    this.range = { from, to };

    this.components['rangePicker'] = new RangePicker(this.range);
  }

  initTable() {
    const url = new URL('api/rest/orders', process.env.BACKEND_URL);
    url.searchParams.set('createdAt_gte', this.range.from.toISOString());
    url.searchParams.set('createdAt_lte', this.range.to.toISOString());

    this.components['sortableTable'] = new SortableTable(header, {
      url,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      },
      noDataTemplate: '<div>Нет заказов</div>'
    });
  }

  initEventListeners() {
    this.subElements['rangePicker'].addEventListener('date-select', this.onDateSelect);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    Object.values(this.components).forEach(component => component.destroy());
  }
}
