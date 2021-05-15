import SortableTable from "../../../components/sortable-table";
import header from "./products-header.js";

export default class Page {
  element;
  subElements = {};
  components = {};

  getTemplate() {
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
              <input type="text" data-element="filterName" class="form-control" placeholder="Product name">
            </div>
            <div class="form-group" data-element="slider">
              <label class="form-label">Price:</label>
            </div>
            <div class="form-group">
              <label class="form-label">Status:</label>
              <select class="form-control" data-element="filterStatus">
                <option value="" selected="">Any</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </form>
        </div>
        <div class="products-list__container" data-element="sortableTable">
        </div>
      </div>
    `;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  initComponents() {
    const priceMin = 0;
    const priceMax = 4000;

    this.components.sortableTable = new SortableTable(
      header,
      {
        url: this.getProductUrl(priceMin, priceMax),
      }
    );
  }

  async renderComponents() {
    const element = await this.components.sortableTable.element;
    this.element.append(element);
  }

  getProductUrl(priceMin, priceMax, filterName, status) {
    return `api/rest/products?_embed=subcategory.category&price_gte=${priceMin}&price_lte=${priceMax}`
      + (filterName ? `&title_like=${encodeURIComponent(filterName)}` : '')
      + (status ? `&status=${status}` : '');
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
