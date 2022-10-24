import ProductForm from "../../../components/product-form";
import RangeSlider from "../../../components/double-slider";
import SortableTable from "../../../components/sortable-table";
import header from './products-header';

import fetchJson from '../../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30', BACKEND_URL);
  form;
  to;

  async updateComponents (from, to) {
    const data = await this.loadData(from, to);

    this.element.querySelector('.sortable-table__body').innerHTML = '';

    this.components.sortableTable.update(data);
  }

  async loadData(from, to) {
    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);


    const data = await fetchJson(this.url);

    return data;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const rangeSlider = new RangeSlider();

    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`
    })

    this.components = {
      rangeSlider,
      sortableTable
    }

  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    })
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
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="rangeSlider">
            <label class="form-label">Цена:</label>
            <!-- rage-slider component -->
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

      <div data-element="sortableTable" class="products-list__container">
        <!-- sortable-table component -->
      </div>
    </div>
    `
  }

  initEventListeners() {
    this.components.rangeSlider.element.addEventListener('range-select', event => {
      const  { from, to } = event.detail;

      this.from = from;
      this.to = to;

      this.updateComponents(from, to);
    });

    window.addEventListener('scroll', this.onWindowScroll);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
}
