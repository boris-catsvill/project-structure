import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

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
    order = "desc",
    start = 1,
    end = 20
  ) {
    const pathNameURL = `${process.env.BACKEND_URL}api/rest/orders`;
    const fetchURL = new URL(pathNameURL);

    fetchURL.searchParams.set("createdAt_gte", from.toISOString());
    fetchURL.searchParams.set("createdAt_lte", to.toISOString());
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

  async renderComponents() {
    const { rangePicker, sortableTable } = this.subElements;
    const { from, to } = this.range;

    this.rangePickerElement = new RangePicker(this.range);
    this.sortableTableElement = new SortableTable(header, {
      url: `api/rest/orders?_start=0&_end=20&createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
    });

    this.getSortableTableUpdate(from, to);

    rangePicker.append(this.rangePickerElement.element);
    sortableTable.append(this.sortableTableElement.element);
  }

  onDateSelect = async (event) => {
    const progressBar = document.querySelector(".progress-bar");
    progressBar.style.display = "block";

    const { from, to } = event.detail;

    this.getSortableTableUpdate(from, to);

    progressBar.style.display = "none";
  };

  async getSortableTableUpdate(from, to) {
    const data = await this.fetchSortableTableData(from, to);
    this.sortableTableElement.renderRows(data);
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

  async render() {
    const element = document.createElement("div");

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initListeners();
    await this.renderComponents();


    const progressBar = document.querySelector(".progress-bar");
    progressBar.style.display = "none";
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

  initListeners() {
    this.element.addEventListener("date-select", this.onDateSelect);
  }

  removeListeners() {
    this.element.removeEventListener("date-select", this.onDateSelect);
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