import RangePicker from "../../components/range-picker";
import SortableTable from "../../components/sortable-table";
import PageBase from "../page-base";
import header from "./orders-header";
import process from "process";

export default class Page extends PageBase {
  subElements;
  components = {};

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    
    this.initComponents();

    this.subElements = this.getSubElements();
    this.renderComponents();

    this.subElements.rangePicker.addEventListener('date-select', event => this.onDateSelected(event));

    return this.element;
  }

  onDateSelected(event) {
    const { from, to } = event.detail;
    this.components.ordersContainer.setUrl(this.getUrl(from, to));
  };

  initComponents() {
    const to = new Date();
    const from = new Date();
    from.setMonth(to.getMonth() - 1);
    this.components.rangePicker = new RangePicker({from, to});
    this.components.ordersContainer = new SortableTable(header, {
      url: this.getUrl(from, to),
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    });
  }

  getUrl(from, to) {
    const url = new URL('api/rest/orders', process.env.BACKEND_URL);
    if (from) {
      url.searchParams.append('createdAt_gte', from);
    }
    if (to) {
      url.searchParams.append('createdAt_lte', to);
    }
    return url.toString();
  }

  getTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="ordersContainer" class="full-height flex-column"></div>
      </div>
    `;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }

  destroy() {
    if (this.components) {
      for (const component of Object.values(this.components)) {
        component.destroy();
      }
    }
    this.components = null;
    this.remove();
  }
}