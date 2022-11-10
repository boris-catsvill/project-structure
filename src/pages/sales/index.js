import SortableTable from "../../components/sortable-table";
import RangePicker from '../../components/range-picker/index';
import header from "./salesHeader";
import fetchJson from "../../utils/fetch-json";

export default class Page {
  element;
  components = {};

  async updateTableComponent (from, to) {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`);
    this.components.sortableTable.addRows(data);
  }

  async initComponents() {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.components.sortableTable = new SortableTable(header, {
        url: `${process.env.BACKEND_URL}api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`,
    });
    this.components.rangePicker = new RangePicker({from: from, to: to})
  }

  get template() {
    return `
    <div class="sales full-height flex-column">
      <div class="content__top-panel">
        <h1 class="page-title">
          Продажи
        </h1>
        <div class="rangepicker" data-element="rangePicker"></div>
      </div>
      <div class="full-height flex-column" data-element="sortableTable"></div>
    </div>
    `
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template

    this.element = element.firstElementChild

    this.subElements = this.getSubElements(this.element);

    this.initComponents()
    await this.renderComponents();

    this.initEventListeners()

    return this.element;
  }

  async renderComponents() {
    Object.keys(this.components).forEach(component => {
        console.log(component);
        const root = this.subElements[component];
        const { element } = this.components[component];
  
        root.append(element);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', (event) => {
        const {from, to} = event.detail
        this.updateTableComponent(from, to)
    })
  }

  remove() {
    if (this.element) {
      this.element.remove;
    }
    this.element = null;
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
    this.components = null;
  }
}