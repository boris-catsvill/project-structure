import DoubleSlider from '../../../components/double-slider/index.js';
import SortableTable from '../../../components/sortable-table/index.js';

import header from './product-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.sliderMinValue = 1;
    this.sliderMaxValue = 4000;

    this.searchInTitle = '';
    this.searchInStatus = '';
  }

  resetFilters() {
    this.sliderMinValue = 1;
    this.sliderMaxValue = 4000;
    this.components.doubleSlider.update('isReset');

    
    this.searchInTitle = '';
    this.subElements.filterName.value = '';

    this.searchInStatus = '';
    this.subElements.filterStatus.value = '';
  }

  updateComponents() {
    const url = new URL(
      'api/rest/products?_embed=subcategory.category&_start=0&_end=30',
      process.env.BACKEND_URL
    );

    if (this.searchInTitle) {
      url.searchParams.set('title_like', this.searchInTitle);
    }
    if (this.searchInStatus) {
      url.searchParams.set('status', this.searchInStatus);
    }
    if (this.sliderMinValue) {
      url.searchParams.set('price_gte', this.sliderMinValue);
    }
    if (this.sliderMaxValue) {
      url.searchParams.set('price_lte', this.sliderMaxValue);
    }

    this.components.sortableTable.url = url;
    this.components.sortableTable.update();
  }

  getComponents() {
    const doubleSlider = new DoubleSlider({ min: this.sliderMinValue, max: this.sliderMaxValue });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
    });

    this.components.doubleSlider = doubleSlider;
    this.components.sortableTable = sortableTable;
  }

  insertComponents() {
    for (const component in this.components) {
      const subElement = this.subElements[component];
      const { element } = this.components[component];
      subElement.append(element);
    }
  }

  addEventListeners() {
    this.subElements.sortableTable.addEventListener('button-reset', () => {
      this.resetFilters();
      this.updateComponents();
    });

    this.subElements.filterName.addEventListener('input', () => {
      this.searchInTitle = this.subElements.filterName.value;
      this.updateComponents();
    });

    this.subElements.filterStatus.addEventListener('change', event => {
      this.searchInStatus = event.target.value;
      this.updateComponents();
    });

    this.components.doubleSlider.element.addEventListener('range-select', event => {
      this.sliderMinValue = event.detail.from;
      this.sliderMaxValue = event.detail.to;
      this.updateComponents();
    });
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.getComponents();
    this.insertComponents();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="products-list">
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
            <div class="form-group" data-element="doubleSlider">
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
      </div>
    `
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};

    for (const component of Object.keys(this.components)) {
      this.components[component].destroy();
    }

    this.components = {};
  }
}
