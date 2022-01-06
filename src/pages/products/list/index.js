import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';
import fetchJson from '../../../utils/fetch-json';

const API_URL = 'api/rest/products?_embed=subcategory.category';

export default class Page {
  element;
  subElements = {};
  components = {};
  loadStep = 30;
  loadStart = 0;
  sliderMin = 1000;
  sliderMax = 4000;

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();

    return this.element;
  }

  async updateTableComponent () {
    const params = this.getParamsFromForm();
    const {status, title_like, price_lte, price_gte} = params;
    const {sorted} = this.components.sortableTable;

    this.components.sortableTable.filters = params;

    const url = new URL(API_URL, process.env.BACKEND_URL);
    url.searchParams.set('_sort', sorted.id);
    url.searchParams.set('_order', sorted.order);
    url.searchParams.set('_start', this.loadStart.toString());
    url.searchParams.set('_end', this.loadStep.toString());
    url.searchParams.set('price_lte', price_lte);
    url.searchParams.set('price_gte', price_gte);

    if (status) {
      url.searchParams.set('status', status);
    }

    if (title_like) {
      url.searchParams.set('title_like', title_like);
    }

    const data = await fetchJson(url);

    this.components.sortableTable.update(data, false);
  }

  get template () {
    return `<div class="product-list">
      <div class="content__top-panel">
        <h2 class="page-title">Products</h2>
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

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  initComponents() {
    const sortableTable = new SortableTable(header, {
      url: API_URL,
      sorted: {
        id: 'title',
        order: 'asc'
      },
      start: this.loadStart,
      step: this.loadStep,
      isSortLocally: false
    });

    const sliderContainer = new DoubleSlider({min: this.sliderMin, max: this.sliderMax});

    this.components.sortableTable = sortableTable;
    this.components.sliderContainer = sliderContainer;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    this.subElements.emptyPlaceholder.querySelector('button').addEventListener('pointerdown', this.clearFilters);

    this.subElements.filterStatus.addEventListener('change', () => {
      this.updateTableComponent();
    });

    this.subElements.filterName.addEventListener('input', () => {
      this.updateTableComponent();
    });

    this.components.sliderContainer.element.addEventListener('range-select', () => {
      this.updateTableComponent();
    });
  }

  clearFilters = () => {
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';

    this.components.sliderContainer.min = this.sliderMin;
    this.components.sliderContainer.max = this.sliderMax;
    this.components.sliderContainer.update();

    this.updateTableComponent();
  }

  getParamsFromForm() {
    const result = {};
    const { from, to } = this.components.sliderContainer.getValue();

    result.price_lte = to;
    result.price_gte = from;
    result.status = this.subElements.filterStatus.value;
    result.title_like = this.subElements.filterName.value;

    return result;
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
