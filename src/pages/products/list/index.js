/* eslint-disable no-undef */
import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';

export default class Page {
  element;
  components = {};
  subElements = {};

  sortBy = new Map([
    ['title_like', ''],
    ['price_gte', 0],
    ['price_lte', 4000],
    ['status', null]
  ]);

  onFilteredStatusChange = async ({ target }) => {
    this.sortBy.set('status', target.value);
    await this.filterData();
  };

  onFilteredPriceChange = async ({ detail }) => {
    this.sortBy.set('price_gte', detail.from);
    this.sortBy.set('price_lte', detail.to);
    await this.filterData();
  };

  onFilteredTitleChange = async ({ target }) => {
    const value = target.value;

    if (!value.length || value.length > 2) {
      this.sortBy.set('title_like', value);
      await this.filterData();
    }
  };

  onClickClearFilters = async ({ target }) => {
    if (target.closest('[data-element=emptyPlaceholder] button')) {
      this.sortBy = new Map();
      this.subElements['filterName'].value = '';
      this.subElements['filterStatus'].value = '';

      const slider = this.components.slider;
      slider.resetSelection();
      slider.update();

      await this.filterData();
    }
  };

  constructor() {
    this.charts = { orders: 'orders', sales: 'sales', customers: 'customers' };
  }

  get url() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');

    return url;
  }

  get template() {
    return `
      <div class="products-list">
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
            <div class="form-group" data-element="sliderContainer">
              <label class="form-label">Цена:</label>
              <!-- Double slider -->
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
        <div data-element="productsContainer" class="products-list__container"><!-- Table --></div>
      </div>
    `;
  }

  initComponents() {
    this.initTable();
    this.initDoubleSlider();

    Object.entries(this.components).forEach(([key, value]) => this.subElements[key] = value.element);
  }

  renderComponents() {
    this.subElements['productsContainer'].append(this.subElements['sortableTable']);
    this.subElements['sliderContainer'].append(this.subElements['slider']);
  }

  render() {
    this.element = this.getElementFromTemplate(this.template);
    this.subElements = this.getSubElements();
    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  initTable() {
    const url = this.url;

    this.components['sortableTable'] = new SortableTable(header, {
      url,
      sorted: {
        id: 'title',
        order: 'asc'
      },
      clickableRow: { isRowClickable: true, href: '/products/'},
      noDataTemplate: `
        <div>
          <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
          <button type="button" class="button-primary-outline">Очистить фильтры</button>
        </div>
      `
    });
  }

  initDoubleSlider() {
    this.components['slider'] = new DoubleSlider();
  }

  initEventListeners() {
    this.subElements['filterStatus'].addEventListener('change', this.onFilteredStatusChange);
    this.subElements['filterName'].addEventListener('input', this.onFilteredTitleChange);
    this.subElements['slider'].addEventListener('range-select', this.onFilteredPriceChange);
    this.subElements['productsContainer'].addEventListener('pointerdown', this.onClickClearFilters);
  }

  async filterData() {
    const table = this.components.sortableTable;

    const url = this.url;
    this.sortBy.forEach((value, key) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    table.url = url;
    table.avoidToLoadNewData = false;

    table.setFirstRecordToLoad();
    await table.loadData();
    table.update();
  }

  getSubElements(element = this.element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    Object.values(this.components).forEach(component => component.destroy());
  }
}
