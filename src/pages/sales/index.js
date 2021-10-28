import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  components = {};
  from = new Date('09.24.2021');
  to = new Date();

  onChangeRange = event => {
    this.from = event.detail.from;
    this.to = event.detail.to;
    this.updateComponents();
  };

  render() {
    this.initComponents();
    this.element = this.toHTML(this.getTemplate());
    this.renderComponents();
    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();
    return this.element;
  }

  getTemplate() {
    return `
        <div class="sales full-height flex-column">
            <div class="content__top-panel">
            <h1 class="page-title">Продажи</h1>
            <div data-rangePicker></div>
            </div>
            <div data-elem="ordersContainer" class="full-height flex-column">
            <div data-sortableTable></div>
            </div>
        </div>
    `;
  }

  initComponents() {
    const rangePicker = new RangePicker({ from: this.from, to: this.to });
    rangePicker.element.dataset.element = 'rangePicker';

    const sortableTable = this.initSortableTable();

    this.components = {
      rangePicker,
      sortableTable
    };
  }

  initSortableTable() {
    const bestsellersUrl = new URL('api/rest/orders', BACKEND_URL);
    bestsellersUrl.searchParams.set('createdAt_gte', this.from.toISOString());
    bestsellersUrl.searchParams.set('createdAt_lte', this.to.toISOString());
    const sortableTable = new SortableTable(header, {
      url: bestsellersUrl.toString(),
      sorted: {
        id: 'createdAt',
        order: 'desc'
      },
    });
    sortableTable.element.dataset.element = 'sortableTable';

    return sortableTable;
  }

  renderComponents() {
    for (const component of Object.entries(this.components)) {
      this.element.querySelector(`[data-${component[0]}]`).replaceWith(component[1].element);
    }
  }

  updateComponents() {
    const sortableTable = this.initSortableTable();
    this.subElements.sortableTable.replaceWith(sortableTable.element);
    this.components.sortableTable.destroy();
    this.components.sortableTable = sortableTable;
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach(el => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  addEventListeners() {
    document.addEventListener('date-select', this.onChangeRange);
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}
