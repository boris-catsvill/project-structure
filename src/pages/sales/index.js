import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './headerConfig.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  range = {
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  };
  url = new URL('api/rest/orders', process.env.BACKEND_URL);

  getTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Sales</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="full-height flex-column">
          <div data-element="sortableTable"></div>
        </div>
      </div>
    `;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll(`[data-element]`);

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  async render() {
    const wraper = document.createElement('div');

    wraper.innerHTML = this.getTemplate();

    this.element = wraper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.getComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const sorted = {
      id: 'createdAt',
      order: 'desc',
    }

    const rangePicker = new RangePicker({to: this.range.to, from: this.range.from});

    
    const {
      from: createdAt_gte,
      to: createdAt_lte
    } = rangePicker.selected

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders`,
      range: {
        createdAt_gte: createdAt_gte,
        createdAt_lte: createdAt_lte
      },
      sorted,
    });

    this.components = {
      sortableTable,
      rangePicker,
    };
  }

  getComponents() {
    this.subElements.sortableTable.append(this.components.sortableTable.element);
    this.subElements.rangePicker.append(this.components.rangePicker.element);
  }

  onRangeSelect = (event) => {
    const { from, to } = event.detail;

    this.update(from, to);
  }

  async loadData(from, to) {
    this.url.searchParams.set('createdAt_gte', from.toISOString());
    this.url.searchParams.set('createdAt_lte', to.toISOString());

    const data = await fetchJson(this.url);

    return data;
  }

  async update(from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);
  }
  
  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.onRangeSelect);
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
    this.components = {};
  }

}