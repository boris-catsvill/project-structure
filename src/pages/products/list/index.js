import SortableTable from "../../../components/sortable-table/index.js";
import SortFilter from "../components/sort-filter/index.js";
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
    this.addEmptyPlaceholder();
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
    Object.values(this.components).forEach(value => value.destroy());
    this.components = null;
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
      url: new URL('/api/rest/products', process.env.BACKEND_URL),
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

  addEmptyPlaceholder() {
    const {productsContainer} = this.components;
    const {emptyPlaceholder} = productsContainer.subElements;
    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-ouclassName" data-element="resetFilterButton">Reset all filters
        </button>
      </div>
    `;
    emptyPlaceholder.append(div);
  }

  addEventListeners() {
    const {sortFilter} = this.subElements;
    sortFilter.addEventListener(
      'sort-filter-update',
      this.onFilterChange,
      this.abortController.signal
    )

    const resetButton = this.element.querySelector('[data-element=resetFilterButton]');
    resetButton.addEventListener(
      'pointerdown',
      this.onResetFilterButtonClick,
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

  onResetFilterButtonClick = async () => {
    const {productsContainer, sortFilter} = this.components;
    productsContainer.sort({});

    sortFilter.remove();
    sortFilter.render();
    this.subElements.sortFilter.append(sortFilter.element);
  }

}
