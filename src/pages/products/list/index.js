import DoubleSlider from '../../../components/double-slider';
import SortableTable from '../../../components/sortable-table';
import header from './products-header';

export default class ProductListPage {
  element;
  subElements = {};
  components = {};

  initListeners() {
    const { filterStatus, doubleSlider, filterName } = this.subElements;
    doubleSlider.addEventListener('range-select', this.onDoubleSliderChange);
    filterStatus.addEventListener('change', this.onStatusChange);
    filterName.addEventListener('input', this.onNameChange);
  }

  removeListeners() {
    const { filterStatus, doubleSlider, filterName } = this.subElements;
    doubleSlider.removeEventListener('range-select', this.onDoubleSliderChange);
    filterStatus.removeEventListener('change', this.onStatusChange);
    filterName.removeEventListener('input', this.onNameChange);
  }

  onDoubleSliderChange = (event) => {
    console.log(event);
    const { from, to } = event.detail;
    this.minSlider = from;
    this.maxSlider = to;

    this.updateComponents();
  };

  async updateComponents() {
    const { sortableTable } = this.subElements;
    this.sortableTableElement.destroy();

    this.url.searchParams.set('price_gte', this.minSlider);
    this.url.searchParams.set('price_lte', this.maxSlider);

    this.sortableTableElement = new SortableTable(header, { url: this.url });

    sortableTable.append(this.sortableTableElement.element);
  }

  onStatusChange = (event) => {
    const targetValue = event.target.value;
    console.log(targetValue);

    if (targetValue === '') {
      this.url.searchParams.delete('status');
    } else {
      this.url.searchParams.set('status', targetValue);
    }

    this.updateComponents();
  };

  onNameChange = (event) => {
    const targetValue = event.target.value;
    console.log(targetValue);

    if (targetValue) {
      this.url.searchParams.set('title_like', targetValue);
    } else {
      this.url.searchParams.delete('title_like');
    }

    this.url.searchParams.set('title_like', targetValue);

    setTimeout(() => this.updateComponents(), 1000);
  }

  async fetchData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async renderMinMaxSlider() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('_sort', 'price');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('_start', '0');
    url.searchParams.set('_end', '30');

    let min = this.fetchData(url);
    

    url.searchParams.set('_order', 'desc');

    let max = this.fetchData(url);

    [min, max] = await Promise.all([min, max]);

    this.minSlider = min[0].price;
    this.maxSlider = max[0].price;
  }

  async renderComponents() {
    const { sortableTable, doubleSlider } = this.subElements;
    this.url = new URL('api/rest/products', process.env.BACKEND_URL);
    this.url.searchParams.set('_embed', 'subcategory.category');

    await this.renderMinMaxSlider();

    this.url.searchParams.set('price_gte', this.minSlider);
    this.url.searchParams.set('price_lte', this.maxSlider);

    this.doubleSliderElement = new DoubleSlider({ min: this.minSlider, max: this.maxSlider }); 

    this.sortableTableElement = new SortableTable(header, { url: this.url });

    sortableTable.append(this.sortableTableElement.element);
    doubleSlider.append(this.doubleSliderElement.element);
  }

  get template() {
    return `
    <div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>
      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Sort by:</label>
            <input
              type="text"
              data-element="filterName"
              class="form-control"
              placeholder="Product name"
            />
          </div>
          <div data-element="doubleSlider">
            <!-- double-slider component -->
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
      <div data-element="sortableTable" class="products-list__container">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    await this.renderComponents();
    this.initListeners();

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

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.removeListeners();
  }
}
