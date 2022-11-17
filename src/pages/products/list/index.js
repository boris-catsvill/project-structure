import SortableTable from "../../../components/sortable-table/index.js";
import DoubleSlider from "../../../components/double-slider/index.js";
import header from './list-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.temptlate;

    this.element = element.firstElementChild;
    this.fillSubElements();
    this.initComponents();

    return this.element;
  }

  fillSubElements() {
    const allDataElem = this.element.querySelectorAll("[data-elem]");
    for (const element of allDataElem) {
      this.subElements[element.dataset.elem] = element;
    }
  }

  get temptlate() {
    return `
    <div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>
      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Filter:</label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Product name">
          </div>
          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Price:</label>
          </div>
          <div class="form-group">
            <label class="form-label">Status:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" selected="">Any</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </form>
      </div>
      <div data-elem="productsContainer" class="products-list__container">
      </div>
    </div>`;
  }

  filterTable = () => {
    this.timeoutId = clearTimeout(this.timeoutId);

    const sortTable = this.components.sortableTable;
    sortTable.start = 0;
    sortTable.end = sortTable.start + sortTable.step;
    const {
      id,
      order
    } = sortTable.sorted;
    sortTable.sortOnServer(id, order, sortTable.start, sortTable.end);
  }

  filterPriceRangeChange = event => {
    const searchParams = this.components.sortableTable.url.searchParams;
    searchParams.set('price_gte', event.detail.from);
    searchParams.set('price_lte', event.detail.to);
    this.filterTable();
  }

  filterStatusChange = event => {
    const searchParams = this.components.sortableTable.url.searchParams;
    const curValue = event.target.value;
    if(curValue) {
      searchParams.set('status', curValue);
    }
    else {
      searchParams.delete('status');
    }
    this.filterTable();
  }

  filterNameChange = event => {
    const searchParams = this.components.sortableTable.url.searchParams;
    const curValue = event.target.value;
    if(curValue) {
      searchParams.set('title_like', curValue);
    }
    else {
      searchParams.delete('title_like');
    }

    if(!this.timeoutId) {
      this.timeoutId = setTimeout(this.filterTable, 500);
    }
  }

  initComponents() {
    this.components.sortableTable = new SortableTable(header, {
      url: 'api/rest/products?_embed=subcategory.category',
      rowTemplate: (innerHTML, item) => `<a href="/products/${item.id}" class="sortable-table__row">${innerHTML}</a>`
    });
    this.components.doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000
    });
    this.subElements.productsContainer.append(this.components.sortableTable.element);
    this.subElements.sliderContainer.append(this.components.doubleSlider.element);

    this.components.doubleSlider.element.addEventListener('range-select', this.filterPriceRangeChange);
    this.subElements.filterStatus.addEventListener('change', this.filterStatusChange);
    this.subElements.filterName.addEventListener('input', this.filterNameChange);
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
    this.subElements = null;
  }
}
