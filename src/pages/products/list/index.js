import FilterTable from '../../../components/filter-table/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import header from './header.js';

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
      url: 'api/rest/products'
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
  }

  handleClearFilters = event => {
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.filter = {};
    this.components['productsContainer'].applyFilter(this.filter);
  };

  handleFilterNameInput = ({ target }) => {
    this.filter['byName'] = target.value;
    this.components['productsContainer'].applyFilter(this.filter);
  };

  handleFilterStatusChange = ({ target }) => {
    target.value === ''
      ? delete this.filter['byStatus']
      : (this.filter['byStatus'] = parseInt(target.value));
    this.components['productsContainer'].applyFilter(this.filter);
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
          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Цена:</label>
              <!-- RANGE SLIDER-->
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
