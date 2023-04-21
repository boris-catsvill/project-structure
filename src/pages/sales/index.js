import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table';
import header from './orders-header.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.initComponents();
    this.renderComponents();

    return this.element;
  }

  get template() {
    return `
    <div class="sales full-height flex-column">
      <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="orders" class="full-height flex-column">
      </div>
    </div>
    `;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const orders = new SortableTable(header, {
      url: this.getUrl(from, to)
    });

    this.components = { rangePicker, orders };
  }

  getUrl(from, to) {
    const url = new URL('/api/rest/orders', BACKEND_URL);
    url.searchParams.set('createdAt_gte', from);
    url.searchParams.set('createdAt_lte', to);
    url.searchParams.set('_sort', 'createdAt');
    url.searchParams.set('_order', 'desc');
    url.searchParams.set('_start', '1');
    url.searchParams.set('_end', '21');
    return url;
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName]; // ordersChart
      const { element } = this.components[componentName];

      root.append(element);
    });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
