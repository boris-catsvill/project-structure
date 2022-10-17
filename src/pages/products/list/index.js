import DoubleSlider from '../../../components/double-slider/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import header from './products-header.js';

import fetchJson from '../../../utils/fetch-json.js';

export default class ProductListPage {
  element;
  url;
  timeoutID;
  subElements = {};
  components = {};

  async updateTableComponent() {
    this.components.productsContainer.destroy();

    this.url.searchParams.set('price_gte', this.minDoubleSlider);
    this.url.searchParams.set('price_lte', this.maxDoubleSlider);

    const sortableTable = new SortableTable(header, {
      url: this.url
    });
    this.components.productsContainer = sortableTable;
    this.subElements.productsContainer.append(this.components.productsContainer.element);
  }

  resetFiltersHandler = async () => {
    await this.initMinAndMaxCost();

    this.subElements.filterName.value = '';
    this.url.searchParams.delete('title_like');

    this.subElements.filterStatus.value = '';
    this.url.searchParams.delete('status');

    this.components.sliderContainer.setSelectedRangeValue({
      from: this.minDoubleSlider,
      to: this.maxDoubleSlider
    });

    this.updateTableComponent();
  };

  async initMinAndMaxCost() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('_start', 0);
    url.searchParams.set('_end', 1);
    url.searchParams.set('_sort', 'price');
    url.searchParams.set('_order', 'asc');

    let min = fetchJson(url);

    url.searchParams.set('_order', 'desc');

    let max = fetchJson(url);

    [min, max] = await Promise.all([min, max]);

    this.minDoubleSlider = min[0].price;
    this.maxDoubleSlider = max[0].price;
  }

  async initComponents() {
    this.url = new URL('api/rest/products', process.env.BACKEND_URL);
    this.url.searchParams.set('_embed', 'subcategory.category');

    await this.initMinAndMaxCost();

    this.url.searchParams.set('price_gte', this.minDoubleSlider);
    this.url.searchParams.set('price_lte', this.maxDoubleSlider);

    const sliderContainer = new DoubleSlider({
      min: this.minDoubleSlider,
      max: this.maxDoubleSlider
    });

    const productsContainer = new SortableTable(header, {
      url: this.url
    });

    this.components.productsContainer = productsContainer;
    this.components.sliderContainer = sliderContainer;
  }

  get template() {
    return `<div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Products</h1>
          <a href="/products/add" class="button-primary">
            Add product
          </a>
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

            <!-- RangeSlider componnent-->
            <div class="form-group" data-element="sliderContainer">
              <label class="form-label">Cost:</label>
            </div>
            <div class="form-group">
              <label class="form-label">Status:</label>
              <select class="form-control" data-element="filterStatus">
                <option value="" selected="">
                  Any
                </option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </form>
        </div>

        <!-- sortableTable component -->
        <div data-element="productsContainer" class="products-list__container">
        </div>
      </div>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    await this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.components.sliderContainer.element.addEventListener('range-select', event => {
      const { from, to } = event.detail;
      this.minDoubleSlider = from;
      this.maxDoubleSlider = to;

      this.updateTableComponent();
    });

    this.subElements.filterStatus.addEventListener('change', event => {
      const targetValue = event.target.value;

      if (Number.isNaN(parseInt(targetValue))) {
        this.url.searchParams.delete('status');
      } else {
        this.url.searchParams.set('status', targetValue);
      }

      this.updateTableComponent();
    });

    this.subElements.filterName.addEventListener('input', event => {
      clearTimeout(this.timeoutID);

      const targetValue = event.target.value;

      if (targetValue) {
        this.url.searchParams.set('title_like', targetValue);
      } else {
        this.url.searchParams.delete('title_like');
      }

      this.timeoutID = setTimeout(() => this.updateTableComponent(), 1000);
    });

    this.element.addEventListener('reset-filters', this.resetFiltersHandler);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
