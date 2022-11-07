import SortableTable from "./../../components/sortable-table/index.js";
import RangePicker from "./../../components/range-picker/index.js";
import header from "./header.js";

export default class SalesPage {
  abortController = new AbortController();
  element;

  async render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();

    await this.createComponents();
    this.renderComponents();
    this.addEmptyPlaceholder();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div data-element="rangePicker" class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
        </div>
        <div data-element="ordersContainer" class="full-height flex-column">
        </div>
      </div>
    `;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    this.abortController.abort();
    Object.values(this.components).forEach(value => value.destroy());
    this.components = null;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  async createComponents() {
    const dateRange = {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date()
    };
    const rangePicker = new RangePicker(dateRange);

    const ordersContainer = await new SortableTable(header, {
      url: process.env.BACKEND_URL + '/api/rest/orders',
      dataFilters: this.makeDateQueryParam(dateRange)
    });

    this.components = {ordersContainer, rangePicker};
  }

  makeDateQueryParam(dateRange) {
    return {
      createdAt_gte: dateRange.from.toLocaleDateString(),
      createdAt_lte: dateRange.to.toLocaleDateString()
    }
  }

  renderComponents() {
    Object.entries(this.components).forEach(([name, component]) => {
      const subElement = this.subElements[name];
      if (!subElement) {
        return;
      }
      subElement.append(component.element);
    });
  }

  addEventListeners() {
    const {rangePicker, ordersContainer} = this.subElements;
    rangePicker.addEventListener(
      'date-select',
      this.onDateRangeChanged,
      this.abortController.signal
    );
  }

  onDateRangeChanged = async (event) => {
    const range = event.detail;
    if (range === undefined) {
      return;
    }
    const param = this.makeDateQueryParam(range);
    const {ordersContainer} = this.components;
    await ordersContainer.sort(param);
  }

  addEmptyPlaceholder() {
    const {ordersContainer} = this.components;
    const {emptyPlaceholder} = ordersContainer.subElements;
    const div = document.createElement('div');
    div.innerHTML = `
        <p>Нет заказов</p>
    `;
    emptyPlaceholder.append(div);
  }
}
