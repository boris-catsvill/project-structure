import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import salesHeader from './sales-header';

export default class Page {
  subElements = {};
  components = {};
  defaultRange = {
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  };

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

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.components = this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const { from, to } = this.defaultRange;

    const rangePicker = new RangePicker({ from, to });

    const ordersURL = new URL('api/rest/orders', process.env.BACKEND_URL);
    ordersURL.searchParams.set('createdAt_gte', from.toISOString());
    ordersURL.searchParams.set('createdAt_lte', to.toISOString());

    const sortableTable = new SortableTable(salesHeader, {
      url: ordersURL,
      renderEmpty: () => `<div>Нет заказов</div>`,
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

  async updateTable(from, to) {
    const table = this.components.sortableTable;

    table.start = 0;
    table.end = table.step;

    table.url.searchParams.set('createdAt_gte', from.toISOString());
    table.url.searchParams.set('createdAt_lte', to.toISOString());

    table.subElements.body.innerHTML = '';
    const data = await table.loadData(table.sorted.id, table.sorted.order, table.start, table.end);

    table.setRows(data);
  }

  renderComponents() {
    for (const componentName of Object.keys(this.components)) {
      const root = this.subElements[componentName];
      const element = this.components[componentName].element;

      root.append(element);
    }
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateTable(from, to);
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};

    for (const component in this.components) {
      this.components[component].destroy();
    }

    this.components = {};
  }
}
