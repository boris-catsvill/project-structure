import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  getTemplate() {
    return `<div class="sales full-height flex-column">
              <div class="content__top-panel">
                <h1 class="page-title">Sales</h1>
                <div data-element="rangePicker"></div>
              </div>
              <div data-element="ordersContainer" class="full-height flex-column"></div>
            </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll(`[data-element]`);
    const result = {};

    for (const element of elements) {
      result[element.dataset.element] = element;
    }

    return result;
  }

  initComponents() {
    let dt = new Date();

    let range = {
      from: new Date(dt.setMonth(dt.getMonth() - 1)),
      to: new Date(),
    }

    this.components.rangePicker = new RangePicker(range);

    this.components.ordersContainer = new SortableTable(header, {
      url: 'api/rest/orders',
      isSortLocally: false,
      sorted: {
        id: 'createdAt',
        order: 'desc',
      },
      urlSettings: { createdAt_gte: range.from, createdAt_lte: range.to },
    });

    for (let component of Object.keys(this.components)) {
      this.subElements[component].append(this.components[component].element);
    }
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.initComponents();
    this.addEventListeners();

    return this.element;
  }

  updateComponents = async (event) => {
    const settings = {
      createdAt_gte: event.detail.from,
      createdAt_lte: event.detail.to
    };

    await this.components.ordersContainer.update(settings);
  }

  addEventListeners() {
    this.components.rangePicker.element.addEventListener(`date-select`, this.updateComponents);
  }

  removeEventListeners() {
    this.components.rangePicker.element.removeEventListener(`date-select`, this.updateComponents);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
    this.element = null;
  }
}
