import SortableTable from '../../components/sortable-table/index.js';
import RangePicker from '../../components/range-picker/index.js';
import fetchJson from '../../utils/fetch-json.js';
import header from '../dashboard/bestsellers-header.js';
export default class Sales {
  element;
  subElements = {};
  components = {};

  async updateTableComponent(from, to) {
    this.components.sortableTable.updateUrl(from, to);
    const { id, order } = this.components.sortableTable.sorted;
    const data = await this.components.sortableTable.loadData(id, order);
    this.components.sortableTable.addRows(data);
  }

  getMinusMonth() {
   const date = new Date();
   date.setMonth(date.getMonth() - 1);
   return date;
  }

  initComponents() {
    const to = new Date();
    const from = this.getMinusMonth();

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable([
        {id: 'id', title: 'ID', sortable: true},
        {id: 'user', title: 'Client', sortable: true},
        {id: 'createdAt', title: 'Date', sortable: true, template: (el) => {
            const date = new Date(el);
            const dateString = `${('0' + date.getDay()).slice(-2)}-${('0' + date.getMonth()).slice(-2)}-${date.getFullYear()}`;
            return `<div class="sortable-table__cell">${dateString}</div>`;
        }},
        {id: 'totalCost', title: 'Cost', sortable: true},
        {id: 'delivery', title: 'Status', sortable: true}],  {
      url: `/api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      isSortLocally: true
    });

    this.components.sortableTable = sortableTable;
    this.components.rangePicker = rangePicker;
    this.initEventListeners();
  }

  get template() {
    return `<div class="sales">
        <div class="content__top-panel">
          <h2 class="page-title">Sales</h2>
          <div data-element="rangePicker"></div>
        </div>
      <div data-element="sortableTable" class="SortableTable">
      </div>
    </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();

    this.renderComponents();
    return this.element;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];

      root.append(element);
    });
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const {from, to} = event.detail;
      this.updateTableComponent(from, to);
    });
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
