import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';

const DEFAULT_FILTER_FROM = 0;
const DEFAULT_FILTER_TO = 4000;
const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element = null;
  subElements = {};
  components = {};
  filterTitle = '';
  filterStatus = '';
  filterFrom = DEFAULT_FILTER_FROM;
  filterTo = DEFAULT_FILTER_TO;

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const productsContainer = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
      emptyPlaceholder: `<div>
                            <p>No products found matching the selected criteria</p>
                            <button type="button" class="button-primary-outline" data-clear-filters>Clear filters</button>
                         </div>`
    });

    const sliderContainer = new DoubleSlider({
      min: this.filterFrom,
      max: this.filterTo
    });

    this.components = {
      productsContainer,
      sliderContainer
    };
  }

  renderComponents() {
    Object.keys(this.subElements).forEach(key => {
      if (this.components.hasOwnProperty(key)) {
        this.subElements[key].append(this.components[key].element);
      }
    });
  }

  updateComponents({
    filterTitle = this.filterTitle,
    filterStatus = this.filterStatus,
    filterFrom = this.filterFrom,
    filterTo = this.filterTo
  } = {}) {
    const url = new URL(`/api/rest/products`, BACKEND_URL);

    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('price_gte', String(filterFrom));
    url.searchParams.set('price_lte', String(filterTo));

    if (filterTitle) {
      url.searchParams.set('title_like', filterTitle);
    }
    if (filterStatus) {
      url.searchParams.set('status', filterStatus);
    }

    this.components.productsContainer.update(url);
  }

  initEventListeners() {
    let timerId;

    this.subElements.filterStatus.addEventListener('change', event => {
      this.filterStatus = event.target.value;

      this.updateComponents({
        filterStatus: this.filterStatus
      });
    });

    this.subElements.filterName.addEventListener('input', event => {
      this.filterTitle = event.target.value;

      clearTimeout(timerId);

      timerId = setTimeout(() => {
        this.updateComponents({
          filterTitle: this.filterTitle
        });
      }, 100);
    });

    this.subElements.productsContainer.addEventListener('pointerdown', event => {
      if (event.target.hasAttribute('data-clear-filters')) {
        this.resetFilters();
        this.updateComponents();
      }
    });

    this.subElements.sliderContainer.addEventListener('range-select', event => {
      this.filterFrom = event.detail.from;
      this.filterTo = event.detail.to;

      this.updateComponents({
        filterFrom: this.filterFrom,
        filterTo: this.filterTo
      });
    });
  }

  resetFilters() {
    this.filterTitle = '';
    this.filterStatus = '';
    this.filterFrom = DEFAULT_FILTER_FROM;
    this.filterTo = DEFAULT_FILTER_TO;

    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.components.sliderContainer.resetSelected();
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
                <input type="text" data-element="filterName" class="form-control" placeholder="Product name">
              </div>
              <div class="form-group" data-element="sliderContainer">
                <label class="form-label">Price:</label>
              </div>
              <div class="form-group">
                <label class="form-label">Status:</label>
                <select class="form-control" data-element="filterStatus">
                  <option value="" selected="">Any</option>
                  <option value="1">Active</option>
                  <option value="0">Not active</option>
                </select>
              </div>
            </form>
          </div>
          <div data-element="productsContainer" class="products-list__container"></div>
        </div>`;
  }

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');

    return [...subElements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
    }, {});
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

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
