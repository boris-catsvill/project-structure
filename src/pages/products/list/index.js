const BACKEND_URL = 'https://course-js.javascript.ru';
import SortableTable from "../../../components/sortable-table";
import SortFilter from "../components/sort-filter";
import header from "./header.js";

export default class ProductsPage {
  abortController = new AbortController();

  async render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();

    await this.createComponents();
    this.renderComponents();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div data-element="sortFilter" class="content-box content-box_small">
        </div>
        <div data-element="productsContainer" class="products-list__container">
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
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  async createComponents() {
    const productsContainer = await new SortableTable(header, {
      url: BACKEND_URL + '/api/rest/products',
      itemUri: '/products'
    });
    const sortFilter = new SortFilter();
    this.components = {productsContainer, sortFilter};
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
    const {sortFilter} = this.subElements;
    sortFilter.addEventListener(
      'sort-filter-update',
      this.onFilterChange,
      this.abortController.signal
    )

    const {productsContainer} = this.components;
    productsContainer.element.addEventListener(
      'reset-table',
      this.onReset,
      this.abortController.signal
    );

  }

  onFilterChange = (event) => {
    const detail = event.detail;
    if (Object.keys(detail).length === 0) {
      return;
    }
    const filters = this.convertToSortTableFilters(detail);
    const {productsContainer} = this.components;
    productsContainer.sort(filters);
  }


  convertToSortTableFilters(detail) {
    const {filterNameValue, priceFilter, filterStatus} = detail;
    const result = {
      title_like: filterNameValue,
      status: filterStatus
    }
    if (priceFilter !== undefined) {
      result.price_gte = priceFilter.from;
      result.price_lte = priceFilter.to;
    }
    return Object.entries(result)
      .filter(([_k, v]) => v !== undefined && v !== '')
      .reduce((accum, [k, v]) => {
        accum[k] = v;
        return accum;
      }, {});
  }

  onReset = () => {
    let {sortFilter} = this.components;
    sortFilter.destroy()
    sortFilter = new SortFilter();
    this.components.sortFilter = sortFilter;
    this.renderComponents();
  }
}
