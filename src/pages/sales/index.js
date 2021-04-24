import SortableTable from '../../components/sortable-table/index.js';
import RangePicker from '../../components/range-picker/index.js';
import header from './orders-header.js';

export default class SalesPage {
  subElements = {};
  components = {};

  get getTemplate() {
    return `
      <div class="sales">
        <div class="content__top-panel">
          <h2 class="page-title">Продажи</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  get getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]');

    return [...subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements;

    await this.initComponents();
    this.renderComponents();

    this.initEventListeners();

    return this.element;
  }

  async initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      sorted: {
        id: 'createdAt',
        order: 'asc'
      },
      isSortLocally: false
    });

    this.components = {
      rangePicker,
      sortableTable
    };
  }

  async updateComponents(from, to) {
    const { sortableTable } = this.components;

    sortableTable.url = new URL(
      `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      process.env.BACKEND_URL
    );

    const data = await sortableTable.loadData();

    sortableTable.addRows(data);
  }

  renderComponents() {
    Object.entries(this.components).forEach(([title, component]) => {
      const container = this.subElements[title];

      container.append(component.element);
    });
  }

  initEventListeners() {
    const { rangePicker } = this.components;

    rangePicker.element.addEventListener('date-select', ({ detail }) => {
      const { from, to } = detail;

      this.updateComponents(from, to);
    });
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