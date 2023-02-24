import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

export default class Page {
  onDateSelect = event => {
    const { from, to } = event.detail;
    this.sortableTable.setRange({createdAt_gte:from, createdAt_lte:to});
  };

  async initComponents() {
    const getRange = () => {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));

      return { from, to };
    };

    const { from, to } = getRange();

    this.rangePicker = new RangePicker({ from, to });

    this.sortableTable = new SortableTable(header, {
      url: 'api/rest/orders',
      sorted: { id: 'id', order: 'asc' },
      isSortLocally: false,
      step: 30,
      start: 0,
      range: { createdAt_gte:from, createdAt_lte:to }
    });
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    await this.initComponents();

    this.subElements.rangePicker.append(this.rangePicker.element);
    this.subElements.ordersContainer.append(this.sortableTable.element);

    this.initEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
        <div class="sales">
            <div class="content__top-panel">
                <h2 class="page-title">Sales</h2>
                <!-- RangePicker component -->
                <div data-element="rangePicker"></div>
            </div>
            <div data-element="ordersContainer" class="full-height flex-column">
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

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.removeEventListener('date-select', this.onDateSelect);
    this.rangePicker.destroy();
    this.sortableTable.destroy();
    this.remove();
  }
}
