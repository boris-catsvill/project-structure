import LinkedSortableTable from '../../../components/sortable-table/linked';
import DoubleSlider from '../../../components/double-slider/index.js';
import { headers } from './tableHeader';
import { getSubElements } from '../../../utils/helpers';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};
  sliderStart = 0;
  sliderEnd = 4000;
  productStatus = null;
  searchingString = "";
  section = 'products'

  get tempalte(){
    return ` <div class="products-list">
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
                  </div>
                  <div class="form-group" data-element="filterStatus">
                    <label class="form-label">Статус:</label>
                    <select class="form-control">
                      <option value selected>Любой</option>
                      <option value="1">Активный</option>
                      <option value="0">Неактивный</option>
                    </select>
                  </div>
                </form>
              </div>
              <div class="products-list__container" data-element="productsContainer"></div>
            </div>`
  }

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.tempalte;
    this.element = element.firstElementChild;
    this.subElements = getSubElements(this.element)
    this.initComponents();
    await this.renderComponents();
    return this.element;
  }

  async renderComponents() {
    this.components.sortableTable.subElements.emptyPlaceholder.innerHTML = `
    <div>
      <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
      <button data-element="resetButton" type="button" class="button-primary-outline">Очистить фильтры</button>
    </div>`;

    const sortableTableElement = this.components.sortableTable.element;
    const doubleSliderElement = this.components.doubleSlider.element;

    this.subElements.productsContainer.append(sortableTableElement);
    this.subElements.sliderContainer.append(doubleSliderElement);

    this.initEventListeners();

  }

  initComponents() {
    this.url = new URL("api/rest/products", BACKEND_URL);
    const params = {
      _embed: 'subcategory.category',
      _sort: 'title',
      _order: 'desc',
    };
    this.url.search = new URLSearchParams(params).toString()
    const sortableTable = new LinkedSortableTable(headers, {
      url: this.url, isSortLocally: false, start: 0, step: 30
    });

    this.components.doubleSlider = new DoubleSlider({ min: 0, max: 4000 });
    this.components.sortableTable = sortableTable;

  }

  initEventListeners(){
    this.subElements.filterStatus.addEventListener("change", event => {
      this.productStatus = event.target.value;
      this.update();
    });

    this.components.doubleSlider.element.addEventListener("range-select", event => {
      this.sliderStart = event.detail.from;
      this.sliderEnd = event.detail.to;
      this.update();
    });

    this.subElements.filterName.addEventListener("input", () => {
      this.searchingString = this.subElements.filterName.value;
      this.update();
    });

    const resetButton = this.element.querySelector('[data-element="resetButton"]');
    resetButton.addEventListener("click", () => {
      this.resetFilters();
      this.update();
    });
  }

  async update(){
    const url = this.url;

    if (this.searchingString) {
      url.searchParams.set("title_like", this.searchingString);
    }
    if (this.productStatus) {
      url.searchParams.set("status", this.productStatus);
    }

    url.searchParams.set("price_gte", this.sliderStart);
    url.searchParams.set("price_lte", this.sliderEnd);

    const sortableTable = this.components.sortableTable
    sortableTable.url = url;
    const data = await sortableTable.loadData();

    sortableTable.element.classList.remove("sortable-table_empty");
    if (!data.length) {
      sortableTable.element.classList.add("sortable-table_empty");

    }

    sortableTable.addRows(data);
  }

  resetFilters(){
    this.sliderStart = 0;
    this.sliderEnd = 4000;
    this.productStatus = null;
    this.searchingString = "";
    this.subElements.filterName.value = "";
    this.subElements.filterStatus.value = null;
    this.components.doubleSlider.reInit(this.sliderStart, this.sliderEnd);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
