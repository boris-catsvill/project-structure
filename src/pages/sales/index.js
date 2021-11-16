import RangePicker from '@/components/range-picker/index.js';
import SortableTable from '@/components/sortable-table/index.js';
import header from '@/pages/sales/header.js';
import fetchJson from '@/utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = 'api/rest/orders';

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);

    this.initComponent();
    this.renderComponent();
    this.initEventListeners();

    return this.element;
  }

  get template() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Sales</h2>
          <div data-element="rangePicker"></div>
        </div>

        <div data-element="sortableTable" class="full-height flex-column"></div>
      </div>
    `;
  }

  initComponent() {
    const now = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const to = new Date();

    const rangePicker = new RangePicker({ from, to });
    const sortableTable = new SortableTable(header, {
      url: `${this.url}?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      },
      emptyPlaceholderHtml: 'No orders'
    });

    this.components = {
      rangePicker,
      sortableTable
    };
  }

  renderComponent() {
    for (const [key, component] of Object.entries(this.components)) {
      this.subElements[key].append(component.element);
    }
  }

  async updateComponents(from, to) {
    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);
  }

  loadData(from, to) {
    const url = new URL(this.url, process.env.BACKEND_URL);

    url.searchParams.set('_sort', 'createdAt');
    url.searchParams.set('_order', 'desc');
    url.searchParams.set('_start', '0');
    url.searchParams.set('_end', '30');
    url.searchParams.set('createdAt_gte', from.toISOString());
    url.searchParams.set('createdAt_lte', to.toISOString());

    return fetchJson(url);
  }

  destroyComponents() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.destroyComponents();
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
