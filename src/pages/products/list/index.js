import DoubleSlider from '@/components/double-slider/index.js';
import SortableTable from '@/components/sortable-table/index.js';
import header from '@/pages/products/list/header.js';
import fetchJson from '@/utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = 'api/rest/products';
  defaultFormData = {
    title: '',
    price: {
      min: 0,
      max: 4000
    },
    status: null
  };

  onInputTitle = event => {
    const value = event.target.value.trim();

    this.formData.title = value;

    if (value) this.updateProducts();
  }

  onRangeSelect = event => {
    const { from: min, to: max } = event.detail;

    this.formData.price = { min, max };
    this.updateProducts();
  }

  onChangeStatus = event => {
    const value = event.target.value.trim();

    this.formData.status = value ? parseInt(value) : null;
    this.updateProducts();
  }

  onClearFilters = event => {
    if (event.target.closest('[data-clear-filters-handle]')) {
      event.preventDefault();

      this.clearFilters();
      this.updateProducts();
    }
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);

    this.initComponent();
    this.renderComponent();
    this.initEventListeners();

    return this.element;
  }

  get template() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h2 class="page-title">Products</h2>
          <a href="/products/add" class="button-primary">Add product</a>
        </div>

        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Sort by:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Product name">
            </div>

            <div class="form-group">
              <label class="form-label">Price:</label>
              <div data-element="rangeSlider"></div>
            </div>

            <div class="form-group">
              <label class="form-label">Status:</label>
              <select class="form-control" data-element="filterStatus">
                <option value="" selected>Any</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </form>
        </div>

        <div data-element="sortableTable" class="products-list__container"></div>
      </div>
    `;
  }

  initComponent() {
    const { min, max } = this.defaultFormData.price;
    const rangeSlider = new DoubleSlider({ min, max });
    const sortableTable = new SortableTable(header, {
      url: `${this.url}?_embed=subcategory.category`,
      getTemplateBodyRow: (item, cells) => `<a href="/products/${item.id}" class="sortable-table__row">${cells}</a>`,
      emptyPlaceholderHtml: `
        <div>
          <p>No items found matching the selected criteria</p>
          <button type="button" class="button-primary-outline" data-clear-filters-handle>Clear filters</button>
        </div>
      `
    });

    this.formData = {...this.defaultFormData};
    this.components = {
      rangeSlider,
      sortableTable
    };
  }

  renderComponent() {
    for (const [key, component] of Object.entries(this.components)) {
      this.subElements[key].append(component.element);
    }
  }

  async updateProducts() {
    const data = await this.loadProducts();

    this.components.sortableTable.update(data);
  }

  loadProducts() {
    const url = new URL(this.url, process.env.BACKEND_URL);
    const { title, price, status } = this.formData;

    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('_start', '0');
    url.searchParams.set('_end', '30');
    url.searchParams.set('price_gte', price.min);
    url.searchParams.set('price_lte', price.max);

    if (title) {
      url.searchParams.set('title_like', title);
    }

    if (status !== null) {
      url.searchParams.set('status', status);
    }

    return fetchJson(url);
  }

  destroyComponents() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  clearFilters() {
    this.formData = {...this.defaultFormData};
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.components.rangeSlider.update();
  }

  initEventListeners() {
    this.subElements.filterName.addEventListener('input', this.onInputTitle);
    this.subElements.filterStatus.addEventListener('change', this.onChangeStatus);
    this.subElements.sortableTable.addEventListener('pointerdown', this.onClearFilters);
    this.components.rangeSlider.element.addEventListener('range-select', this.onRangeSelect);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.destroyComponents();
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
