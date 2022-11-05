import SortableTable from "../../../components/sortable-table/index.js";
import header from "./product-list-header.js";
import DoubleSlider from "../../../components/double-slider/index.js";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  sliderStart = 0;
  sliderEnd = 4000;
  productStatus = null;
  searchingString = "";
  searchParams = {
    _start: 0,
    _end: 30,
    _sort: 'title',
    _order: 'asc',
    _embed: 'subcategory.category'
  }

  get tempalte() {
    return ` 
      <div class = "products-list">
        <div class = "content__top-panel">
          <h1 class = "page-title">Products list</h1>
          <a href = "/products/add" class = "button-primary">Add new product</a>
        </div>
        <div class = "content-box content-box_small">
          <form class = "form-inline">
            <div class = "form-group">
              <label class = "form-label">Sort by:</label>
              <input type = "text" data-element = "filterName" class = "form-control" placeholder = "Product title">
            </div>
            <div class = "form-group" data-element = "sliderContainer">
              <label class = "form-label">Price:</label>
            </div>
            <div class = "form-group">
              <label class = "form-label">Status:</label>
              <select class = "form-control" data-element = "filterStatus">
                <option value selected>Any</option>
                <option value = "1">Active</option>
                <option value = "0">Inactive</option>
              </select>
            </div>
          </form>
        </div>
        <div class = "products-list__container" data-element = "productsContainer"></div>
      </div>`
  }

  async render() {
    const element = document.createElement("div");

    element.innerHTML = this.tempalte;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();

    await this.renderComponents();

    return this.element;
  }

  async renderComponents() {

    this.components.sortableTable.subElements.emptyPlaceholder.innerHTML = `
    <div>
      <p>No products found</p>
      <button data-element = "resetButton" type="button" class = "button-primary-outline">Reset filters</button>
    </div>`;

    const sortableTableElement = this.components.sortableTable.element;
    const doubleSliderElement = this.components.doubleSlider.element;

    this.subElements.productsContainer.append(sortableTableElement);
    this.subElements.sliderContainer.append(doubleSliderElement);

    this.initEventListeners();

  }

  initComponents() {

    this.url = new URL("api/rest/products", BACKEND_URL);

    const sortableTable = new SortableTable(header, {
      searchParams: this.searchParams,
      url: this.url,
      isSortLocally: false,
      isProductLink: true,
    });

    const min = 0;
    const max = 4000;

    const doubleSlider = new DoubleSlider({ min, max });

    this.components.doubleSlider = doubleSlider;
    this.components.sortableTable = sortableTable;

  }

  initEventListeners() {
    this.subElements.filterStatus.addEventListener("change", event => {
      this.productStatus = event.target.value;
      this.update();
    });

    this.components.doubleSlider.element.addEventListener("range-select", event => {
      this.sliderStart = event.detail.from;
      this.sliderEnd = event.detail.to;
      this.update();
    });

    this.subElements.filterName.addEventListener("input", () => {
      this.searchingString = this.subElements.filterName.value;
      this.update();
    });

    const resetButton = this.element.querySelector('[data-element = "resetButton"]');
    resetButton.addEventListener("click", () => {
      this.resetFilters();
      this.update();
    });
  }

  async update() {
    const url = this.url;

    if (this.searchingString) {
      url.searchParams.set("title_like", this.searchingString);
    } else {
      url.searchParams.delete("title_like");
    }
    if (this.productStatus) {
      url.searchParams.set("status", this.productStatus);
    }

    url.searchParams.set("price_gte", this.sliderStart);
    url.searchParams.set("price_lte", this.sliderEnd);

    const sortableTable = this.components.sortableTable;
    sortableTable.url = url;
    const data = await sortableTable.loadData();

    sortableTable.element.classList.remove("sortable-table_empty");
    if (!data.length) {
      sortableTable.element.classList.add("sortable-table_empty");

    }
    sortableTable.addRows(data);
  }

  resetFilters() {
    this.sliderStart = 0;
    this.sliderEnd = 4000;
    this.productStatus = null;
    this.searchingString = "";

    this.subElements.filterName.value = "";
    this.subElements.filterStatus.value = null;

    this.components.doubleSlider.reset(this.sliderStart, this.sliderEnd);

  }

  getSubElements(element = this.element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}