import PageBase from "../../page-base";
import DoubleSlider from "../../../components/double-slider";
import SortableTable from "../../../components/sortable-table";
import header from "./products-header.js";
import process from "process";

export default class Page extends PageBase {
  element;
  subElements;
  components = {};
  filter = {
    minPrice: 0,
    maxPrice: 4000
  };

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    await this.renderComponents();

    this.initEventListeners();

    return this.element;
  }

  getBackendUrl() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    const { minPrice, maxPrice, titleLike, status } = this.filter;
    if (titleLike) {
      url.searchParams.set('title_like', titleLike)
    }
    if (status) {
      url.searchParams.set('status', status)
    }
    url.searchParams.set('price_gte', minPrice);
    url.searchParams.set('price_lte', maxPrice);
    return url.toString();
  }

  initEventListeners() {
    this.subElements.filterName.addEventListener("input", event => this.onFilterNameInput(event));
    this.subElements.rangeSlider.addEventListener("range-select", event => this.onRangeSelect(event));
    this.subElements.filterStatus.addEventListener("change", event => this.onFilterStatusChanged(event));
  }

  onFilterNameInput(event) {
    this.filter.titleLike = event.target.value;
    this.updateProductTable();
  }

  onRangeSelect(event) {
    const { from, to } = event.detail;
    this.filter.minPrice = from;
    this.filter.maxPrice = to;
    this.updateProductTable();
  }

  onFilterStatusChanged(event) {
    this.filter.status = event.target.value;
    this.updateProductTable();
  }

  async updateProductTable() {
    const { productsTable } = this.components;
    productsTable.setUrl(this.getBackendUrl());
    await productsTable.update();
  }

  getTemplate() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1>List page</h1>
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
              <div data-element="rangeSlider"></div>
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
        <div data-element="productsTable" class="products-list__container"></div>
      </div>`;
  }

  initComponents() {
    this.components.rangeSlider = new DoubleSlider({
      min: this.minPrice,
      max: this.maxPrice
    });
    this.components.productsTable = new SortableTable(
      header, {
      url: this.getBackendUrl(),
      detailLink: '/products',
    });
  }
}
