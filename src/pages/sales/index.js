import RangePicker from "../../components/range-picker/index.js";
import SortableTable from "../../components/sortable-table/index.js";
import header from "./sales-header.js";

export default class Page {
  element;
  subElements = {};
  components = {};

  async updateComponents(from, to) {
    const sortableTable = this.components.sortableTable;
    sortableTable.url.searchParams.set("createdAt_gte", from.toISOString());
    sortableTable.url.searchParams.set("createdAt_lte", to.toISOString());

    sortableTable.update();
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({ from, to });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      sorted: { id: "createdAt", order: "desc" },
      step: 30,
      isSortLocally: false,
      scrollLoad: true,
    });

    this.components = {
      rangePicker,
      sortableTable,
    };
  }
  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      if (element) root.append(element);
    });
  }

  get template() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Sales</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener(
      "date-select",
      (event) => {
        const { from, to } = event.detail;
        this.updateComponents(from, to);
      }
    );
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
