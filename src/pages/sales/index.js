import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
// import header from './sales-header.js';

export default class SalesPage {
  element;
  subElements = {};

  range = {
    to: new Date(),
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  };

  async fetchSortableTableData(
    from = "from",
    to = "to",
    id = "title",
    order = "asc",
    start = 1,
    end = 20
  ) {
    const pathNameURL = `${process.env.BACKEND_URL}api/rest/orders`;
    const fetchURL = new URL(pathNameURL);

    fetchURL.searchParams.set("from", from.toISOString());
    fetchURL.searchParams.set("to", to.toISOString());
    fetchURL.searchParams.set("_sort", id);
    fetchURL.searchParams.set("_order", order);
    fetchURL.searchParams.set("_start", start);
    fetchURL.searchParams.set("_end", end);

    try {
      const response = await fetch(fetchURL.toString());
      const data = await response.json();

      this.element.classList.remove("sortable-table_loading");

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  renderComponents() {
    const { rangePicker, sortableTable } = this.subElements;
    const { from, to } = this.range;

    this.rangePickerElement = new RangePicker(this.range);
    this.sortableTableElement = new SortableTable(header, {
      url: "api/rest/orders",
    });

    this.getSortableTableUpdate(from, to);

    rangePicker.append(this.rangePickerElement.element);
    sortableTable.append(this.sortableTableElement.element);
  }

  get template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Sales</h2>
          <!-- range-picker component -->
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
    this.subElements = this.getSubElements();

    // this.initListeners();
    // TODO: change await to Promise
    // await this.getColumnChart();
    // await this.getRangePicker();
    // await this.getSortableTable();

    // const progressBar = document.querySelector(".progress-bar");
    // progressBar.style.display = "none";
    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element; 
      result[name] = subElement;
    }
    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.removeListeners();
  }

  destroy() {
    this.element.remove();
    this.removeListeners();
  }
}