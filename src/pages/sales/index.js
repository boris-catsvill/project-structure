import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from "../sales/sales-header";

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.dateRange = this.dateSelection.bind(this);
  }

  dateSelection(event) {
    const {from, to} = event.detail;
    this.updateComponents(from, to);
  }

  updateComponents(from, to) {
    this.components.ordersContainer.update(from, to);
  }

  get template() {
    return `
        <div class="sales full-height flex-column">
            <div class="content__top-panel">
                <h1 class="page-title">Продажи</h1>
                <div data-element="rangePicker" class="rangepicker"></div>
            </div>
            <div data-element="ordersContainer" class="full-height flex-column">
            </div>
        </div>
      `;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({from, to});

    const ordersContainer = new SortableTable(header, {
      url: 'api/rest/orders',
      range: {from, to},
    });

    this.components = {
      rangePicker,
      ordersContainer,
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];
      if (root) {
        root.append(element);
      }
    });
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.addListeners();

    return this.element;
  }

  getSubElements(element) {
    let elements = element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});

  }

  addListeners(components) {
    this.components.rangePicker.element.addEventListener('date-select', this.dateRange);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
    this.components.rangePicker.element.removeEventListener('date-select', this.dateRange);
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
