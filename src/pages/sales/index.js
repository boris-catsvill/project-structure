import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import header from './orders-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  get template() {
    return `
      <div class="sales">
        <div class="content__top-panel">
          <h2 class="page-title">Продажи</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="ordersContainer"></div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListners();

    return this.element;
  }

  initComponents() {    
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);

    const rangePicker = new RangePicker({ from, to });

    const ordersContainer = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      sorted: {
        id: 'createdAt',
        order: 'desc',
      },
    });

    this.components = {
      rangePicker,
      ordersContainer,
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  updateComponents(from, to) {
    this.components.ordersContainer.setFilter({
      createdAt_gte: from.toISOString(),
      createdAt_lte: to.toISOString(),
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
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.remove();

    this.element = null;
    this.subElements = null;
    this.components = null;
  }
}
