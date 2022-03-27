import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './product-header.js';

import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  sliderMin = 1;
  sliderMax = 4000;
  titleSearch = '';
  statusSearch = '';

  async updateTableComponent() {
    const url = new URL(
      'api/rest/products?_embed=subcategory.category&_start=1&_end=20',
      process.env.BACKEND_URL
    );

    if (this.titleSearch) {
      url.searchParams.set('title_like', this.titleSearch);
    }
    if (this.statusSearch) {
      url.searchParams.set('status', this.statusSearch);
    }
    if (this.sliderMin) {
      url.searchParams.set('price_gte', this.sliderMin);
    }
    if (this.sliderMax) {
      url.searchParams.set('price_lte', this.sliderMax);
    }

    const data = await fetchJson(url);

    this.components.sortableTable.update(data, true);
  }

  async initComponents() {
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    const sliderContainer = new DoubleSlider({ min: this.sliderMin, max: this.sliderMax });

    const sortableTable = new SortableTable(header, {
      url: `/api/rest/products?_embed=subcategory.category`,
      isSortLocally: true
    });

    this.components.sliderContainer = sliderContainer;
    this.components.sortableTable = sortableTable;
  }

  get template() {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h2 class="page-title">Товары</h2>
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

      <div data-element="sortableTable"></div>
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
    this.subElements.filterName.addEventListener('input', event => {
      this.titleSearch = this.subElements.filterName.value;
      this.updateTableComponent();
    });
    this.subElements.filterStatus.addEventListener('change', event => {
      this.statusSearch = event.target.value;
      this.updateTableComponent();
    });
    this.components.sliderContainer.element.addEventListener('range-select', event => {
      this.sliderMin = event.detail.from;
      this.sliderMax = event.detail.to;
      this.updateTableComponent();
    });
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
