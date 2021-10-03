import BasePage from '../../base-page/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import Notification from '../../../components/notification/index.js';
import { NOTIFICATION_TYPE, PRODUCTS_REST_URL } from '../../../constants';
import header from './products-header.js';

export default class Page extends BasePage {
  onRangeSelect = event => {
    this.updateComponents({price_gte: event.detail.from, price_lte: event.detail.to});
  }

  onFilterStatus = event => {
    this.updateComponents({status: event.target.value});
  }

  onFilterName = event => {
    this.updateComponents({title_like: event.target.value});
  }

  constructor(path) {
    super(path);
  }

  async getComponents() {
    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 5000,
      formatValue: value => `$${value}`
    });

    const sortableTable = new SortableTable(header, {
      url: `${PRODUCTS_REST_URL}?_embed=subcategory.category`,
      rowUrl: '/products'
    });

    sortableTable.subElements.emptyPlaceholder.innerHTML = `
      <div>
        <p>Не найдено товаров, удовлетворяющих выбранным критериям</p>
        <button type="button" name="reset" class="button-primary-outline">Очистить фильтры</button>
      </div>
    `;

    return {
      doubleSlider,
      sortableTable
    };
  }

  async updateComponents(searchParams = {}) {
    this.components.sortableTable.update(searchParams)
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }

  initEventListeners() {
    this.element.addEventListener('range-select', this.onRangeSelect);
    this.subElements.filterStatus.addEventListener('change', this.onFilterStatus);
    this.subElements.filterName.addEventListener('input', this.onFilterName);
    this.element.querySelector('button[name="reset"]').addEventListener('click', () => this.resetFilters());
  }

  resetFilters() {
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';

    this.components.doubleSlider.reset();

    const searchParams = {
      price_gte: '',
      price_lte: '',
      title_like: '',
      status: ''
    };

    this.updateComponents(searchParams);
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
              <div data-element="doubleSlider"></div>
            </div>
            <div class="form-group">
              <label class="form-label">Статус:</label>
              <select class="form-control" data-element="filterStatus">
                <option value="">Любой</option>
                <option value="1">Активный</option>
                <option value="0">Неактивный</option>
              </select>
            </div>
          </form>
        </div>
        <div data-element="sortableTable" class="products-list__container"></div>
      </div>
    `;
  }
}
