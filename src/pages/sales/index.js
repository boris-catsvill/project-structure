import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.url = new URL('api/rest/orders', process.env.BACKEND_URL)
  }

  updateComponents(from, to) {
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('createdAt_gte', `${from.toISOString()}`);
    this.url.searchParams.set('createdAt_lte', `${to.toISOString()}`);
    this.url.searchParams.set('_sort', 'createdAt');
    this.url.searchParams.set('_order', 'desc');

    this.components.sortableTable.url = this.url;
    this.components.sortableTable.update();
  }

  getComponents() {
    const getRange = () => {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));

      return { from, to };
    }
    const { from, to } = getRange();

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sorted = {
      id: 'createdAt',
      order: 'desc',
    }
    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      sorted,
    });

    this.components.rangePicker = rangePicker;
    this.components.sortableTable = sortableTable;
  }

  insertComponents() {
    for (const component in this.components) {
      const subElement = this.subElements[component];
      const { element } = this.components[component];
      subElement.append(element);
    }
  }

  addEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateComponents(from, to);
    });
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.getComponents();
    this.insertComponents();

    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="full-height flex-column">
          <div data-element="sortableTable"></div>
        </div>
      </div>
    `;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
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