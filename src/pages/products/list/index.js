import SortableTable from '../../../components/sortable-table/index.js';
import header from './products-header.js';
import Tooltip from '../../../components/tooltip/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';

import throttle from '../../../utils/debounce.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/rest/products', BACKEND_URL);

  onInputThrottled = throttle(event => {
    this.changeParamsURL.call(this.components.productsContainer, 'title_like', event.target.value);
    this.updateComponents();
  }, 1000);

  onSliderChange = event => {
    this.changeParamsURL.call(this.components.productsContainer, 'price_gte', event.detail.from);
    this.changeParamsURL.call(this.components.productsContainer, 'price_lte', event.detail.to);
    this.updateComponents();
  };
  onOptionChange = event => {
    const value = event.target.value;
    this.changeParamsURL.call(
      this.components.productsContainer,
      'status',
      value === '' ? null : value
    );
    this.updateComponents();
  };

  async updateComponents() {
    this.components.productsContainer.start = 0;
    this.components.productsContainer.end = 30;
    this.components.productsContainer.update();
  }

  changeParamsURL(name, value) {
    if (value == null) this.url.searchParams.delete(name);
    else this.url.searchParams.set(name, value);
  }

  initComponents() {
    const productsContainer = new SortableTable(header, {
      url: this.url + '?_embed=subcategory.category',
      sorted: {
        id: 'title',
        order: 'asc'
      },
      start: 0,
      step: 30,
      isSortLocally: false,
      scrollLoad: true,
      rowTemplate: (data, item) =>
        `<a href="products/${item.id}" class="sortable-table__row">${data}</a>`
    });

    const sliderContainer = new DoubleSlider({ min: 0, max: 4000 });

    const tooltip = new Tooltip();
    tooltip.initialize();

    this.components = {
      productsContainer,
      sliderContainer,
      tooltip
    };
  }
  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      if (element) root.append(element);
    });
  }

  get template() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Products</h1>
          <a href="products/add" class="button-primary">Add product</a>
        </div>
        <div class="content-box content-box_small">
          <form data-element="form" class="form-inline">
            <div class="form-group">
              <label class="form-label">Sort by:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Name product">
            </div>
            <div class="form-group" data-element="sliderContainer">
              <label class="form-label">Price:</label>
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
        <div data-element="productsContainer" class="products-list__container">
          <!-- sortable-table component -->
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  initEventListeners() {
    this.subElements.filterName.addEventListener('input', this.onInputThrottled);
    this.subElements.sliderContainer.addEventListener('range-select', this.onSliderChange);
    this.subElements.filterStatus.addEventListener('change', this.onOptionChange);
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
