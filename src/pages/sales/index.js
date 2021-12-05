import fetchJson from '../../utils/fetch-json';
import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import header from '../sales-header';

export default class Page {
  components;
  url = new URL('api/rest/orders', process.env.BACKEND_URL);

  constructor() {
    this.render();
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getTemplate() {
    return `
      <div class="sales">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="ordersContainer"></div>
      </div>
    `;
  }

  loadData (from, to) {
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('_sort', 'user');
    this.url.searchParams.set('_order', 'desc');
    this.url.searchParams.set('createdAt_gte', from.toISOString());
    this.url.searchParams.set('createdAt_lte', to.toISOString());

    return fetchJson(this.url);
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?_start=1&_end=30&createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      isSortLocally: false,
      page: 'sales',
    });

    this.components = {
      sortableTable,
      rangePicker
    };
  }

  async updateComponents (from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.updateTable(data);
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to)
        .catch((error) => console.error(error));
    });
  }

  renderComponents () {
    this.subElements.rangePicker.append(this.components.rangePicker.element);
    this.subElements.ordersContainer.append(this.components.sortableTable.element);
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
