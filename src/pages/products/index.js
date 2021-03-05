import SortableTable from '../../components/sortable-table/index.js'
import header from './products.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async updateTableComponent (from, to) {
    const data = await fetchJson(`/api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`);
    this.components.sortableTable.update(data);
  }

  async initComponents () {
    const sortableTable = new SortableTable(header, {
      url: `https://course-js.javascript.ru/api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30`,
      isSortLocally: false
    });

    this.components = {
      sortableTable,
    }
  }

  get template () {
    return `<div class="sales full-height flex-column">
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>

      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Цена:</label>
            <div class="range-slider">
              <span data-elem="from">$0</span>
              <div data-elem="inner" class="range-slider__inner">
                <span data-elem="progress" class="range-slider__progress" style="left: 0%; right: 0%;"></span>
                <span data-elem="thumbLeft" class="range-slider__thumb-left" style="left: 0%;"></span>
                <span data-elem="thumbRight" class="range-slider__thumb-right" style="right: 0%;"></span>
              </div>
              <span data-elem="to">$4000</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
      </div>

      <div data-elem="ordersContainer" class="full-height flex-column">
        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    </div>`;
  }

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();

    return this.element;
  }

  renderComponents () {
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
  
  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
