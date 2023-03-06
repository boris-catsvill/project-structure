import FilterTable from '../../../components/filter-table/index.js';
import header from './header.js';
import filters from './filters.js';
import DoubleSlider from '../../../components/double-slider/index.js';
export default class Page {
  element = {};
  subElements = {};
  components = {};
  filter = {};
  controller = new AbortController();

  async render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;

    this.getSubElements();
    this.initComponents();
    this.appendComponents();
    this.initListeners();

    return this.element;
  }

  initComponents() {
    this.components['productsContainer'] = new FilterTable(header, {
      url: 'api/rest/products',
      filters: filters
    });
  }

  initListeners() {
    this.subElements.filterName.addEventListener('input', this.handleFilterNameInput, {
      signal: this.controller.signal
    });
    this.subElements.filterStatus.addEventListener('change', this.handleFilterStatusChange, {
      signal: this.controller.signal
    });
    document.addEventListener('clear-filters', this.handleClearFilters, {
      signal: this.controller.signal
    });
    document.addEventListener('range-select', this.handlePriceRangeSelected, {
      signal: this.controller.signal
    });
    this.components['productsContainer'].element.addEventListener(
      'table-data-loaded',
      this.handleTableLoaded,
      {
        signal: this.controller.signal
      }
    );
  }

  handleClearFilters = () => {
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.filter = {};
    this.components['productsContainer'].applyFilter(this.filter);
  };

  handleFilterNameInput = ({ target }) => {
    this.filter['title'] = target.value;
    this.components['productsContainer'].applyFilter(this.filter);
  };

  handleFilterStatusChange = ({ target }) => {
    target.value === ''
      ? delete this.filter['status']
      : (this.filter['status'] = parseInt(target.value));
    this.components['productsContainer'].applyFilter(this.filter);
  };
  handlePriceRangeSelected = ({ detail }) => {
    this.filter['price'] = detail;
    this.components['productsContainer'].applyFilter(this.filter);
  };

  handleTableLoaded = ({ detail }) => {
    const priceRange = detail.reduce(
      (accum, item) => {
        if (!accum.min) accum.min = item.price;
        if (!accum.max) accum.max = item.price;
        accum.min = accum.min > item.price ? item.price : accum.min;
        accum.max = accum.max < item.price ? item.price : accum.max;
        return accum;
      },
      { min: null, max: null }
    );
    if (this.components['sliderContainer'] && this.components['sliderContainer'].destroy)
      this.components['sliderContainer'].destroy();

    this.components['sliderContainer'] = new DoubleSlider(priceRange);
    this.subElements['sliderContainer'].append(this.components['sliderContainer'].element);
  };

  appendComponents() {
    for (const [name, instance] of Object.entries(this.components)) {
      if (Object.hasOwn(this.subElements, name)) {
        this.subElements[name].append(instance.element);
      }
    }
  }

  getSubElements() {
    for (const item of this.element.querySelectorAll('[data-element]')) {
      this.subElements[item.dataset.element] = item;
    }
  }
  getTemplate() {
    return `<div class="products-list">
    <div class="content__top-panel">
      <h1 class="page-title">Товары</h1>
      <a href="/products/add" class="button-primary">Добавить товар</a>
    </div>
    <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group">
            <label class="form-label">Цена:</label>
              <div data-element="sliderContainer"></div>
          </div>
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

    <div data-element="productsContainer" class="products-list__container"></div>
    </div>`;
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
    this.controller.abort();

    for (const instance of Object.values(this.components)) {
      if (Object.hasOwn(instance, 'destroy')) {
        instance.destroy();
      }
    }
    this.components = null;
  }
}
