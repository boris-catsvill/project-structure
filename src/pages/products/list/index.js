import { productsTableHeader } from '../../../constants';
import DoubleSlider from '../../../components/double-slider';
import ProductsTable from '../../../components/products-table';

export default class Page {
  element;
  subElements = {};
  components = {};
  filters = {
    filterName: '',
    filterStatus: undefined,
    filterRange: { from: 0, to: 4000}
  };

  constructor() {
    this.initComponents();
  }

  handleFilterChange = (event) => {
    const { dataset, value } = event.target;
    const field = dataset.element;
    if (field) {
      this.filters[field] = value;
      this.components.productsTable.updateFilters(this.filters);
    }
  }

  handleRangeSelect = (event) => {
    this.filters.filterRange = event.detail;
    this.components.productsTable.updateFilters(this.filters);
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class='products-list' data-role='products'>
        <div class="content__top-panel">
          <h1 class="page-title">Products</h1>
          <a href="/products/add" class="button-primary">Add Product</a>
        </div>
        <div class="content-box content-box_small">
          <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="doubleSlider"></div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
        </div>
        <div data-element='productsTable'></div>
      </div>`;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');

    const productsTable = new ProductsTable(productsTableHeader, { url, start: 0, step: 30 });
    const doubleSlider = new DoubleSlider({min: 0, max: 4000})

    this.components = { productsTable, doubleSlider }
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListeners() {
    const { filterName, filterStatus } = this.subElements;
    filterName.addEventListener('keyup', this.handleFilterChange);
    filterStatus.addEventListener('change', this.handleFilterChange);
    this.element.addEventListener('range-select', this.handleRangeSelect)
  }

  removeEventListeners() {
    const { filterName, filterStatus } = this.subElements;
    filterName.removeEventListener('keyup', this.handleFilterChange);
    filterStatus.removeEventListener('change', this.handleFilterChange);
    this.element.removeEventListener('range-select', this.handleRangeSelect)
  }

  destroy() {
    this.removeEventListeners();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.subElements = {};
    this.components = {}

    if (this.element) {
      this.element.remove();
    }
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
}
