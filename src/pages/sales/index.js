import fetchJson from '../../utils/fetch-json';
import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import header from '../sales-header';
import getSubElements from '../../utils/getSubElements';

export default class Page {
  components = {};
  url = new URL('api/rest/orders', process.env.BACKEND_URL);

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

    this.components.rangePicker = new RangePicker({
      from,
      to
    });

    this.components.sortableTable = new SortableTable(header, {
      url: `api/rest/orders?_start=1&_end=30&createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      isSortLocally: false,
    });
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

  async renderComponents () {
    const { element: sortableTableElement  } = await this.components.sortableTable;
    const { element: rangePickerElement } = this.components.rangePicker;

    this.subElements.rangePicker.append(rangePickerElement);
    this.subElements.ordersContainer.append(sortableTableElement);
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = getSubElements(this.element, 'element');

    this.initComponents();
    await this.renderComponents();
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
