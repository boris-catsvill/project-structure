import fetchJson from '../../utils/fetch-json.js';
import vars from '../../utils/vars.js';

import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';

const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Client',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'date',
    template: date => {
      const data = new Date(Date.parse(date));
      const year = data.getFullYear();
      const month = (data.getMonth() + 1) < 10 ? '0' + (data.getMonth() + 1) : (data.getMonth() + 1);
      const day = data.getDate() < 10 ? '0' + data.getDate() : data.getDate();
      return `<div class="sortable-table__cell">${day}.${month}.${year}</div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Price',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string'
  },
];

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL(vars.API_REST_ORDERS, vars.BACKEND_URL);

  async updateComponents(from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);
  }

  loadData(from, to) {
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('_sort', 'date');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('createdAt_gte', from.toISOString());
    this.url.searchParams.set('createdAt_lte', to.toISOString());

    return fetchJson(this.url);
  }

  getTemplate() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Sales</h2>

          <!-- range-picker component -->
          <div data-element="rangePicker"></div>
        </div>

        <!-- sortable-table component -->
        <div data-element="sortableTable"></div>
      </div>
      `;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({from, to});

    const sortableTable = new SortableTable(header,
        {
            url: `${vars.API_REST_ORDERS}?_start=1&_end=30&createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
            isSortLocally: false,
            sorted: {id: 'date', order: 'asc'}
        });

    this.components = {
      sortableTable,
      rangePicker
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    });
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
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
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
  }
}
