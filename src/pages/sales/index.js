import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';

import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element = null;
  subElements = {};

  constructor() {
    this.range = {
      from: new Date,
      to: new Date
    }

    this.range.from.setMonth(this.range.from.getMonth() - 1);
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  get template() {
    return `
        <div class="sales">

            <div class="content__top-panel">
              <h2 class="page-title">Sales</h2>
              <!-- RangePicker -->
              <div data-element="rangePicker"></div>
            </div>

            <!-- SortableTable -->
            <div data-element="sortableTable"></div>
        </div>`;
  }

  initComponents() {
    const rangePicker = new RangePicker(this.range);

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${this.range.from.toISOString()}&createdAt_lte=${this.range.to.toISOString()}`,
      isSortLocally: false,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    });

    this.components = {
      rangePicker,
      sortableTable
    };
  }

  renderComponents() {
    Object.keys(this.subElements).forEach(key => {
      this.subElements[key].append(this.components[key].element);
    });
  }

  initEventListeners() {
    this.element.addEventListener('date-select', event => {
      this.range = event.detail;

      this.updateComponents(this.range);
    })
  }

  updateComponents(range) {
    const {from, to} = range;
    const fromISO = from.toISOString();
    const toISO = to.toISOString();

    const url = `api/rest/orders?createdAt_gte=${fromISO}&createdAt_lte=${toISO}`;

    this.components.sortableTable.update(url);
  }

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');

    return [...subElements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
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

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
