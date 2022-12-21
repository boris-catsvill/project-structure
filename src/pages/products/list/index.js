import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';
const BACKEND_URL = 'https://course-js.javascript.ru/';


export default class Page {
  element;
  subElements = {};
  components = {};

  render() {
    this.url = new URL(BACKEND_URL);
    this.url.pathname = '/api/rest/products';
    this.urlParameters = {
      _embed: 'subcategory.category',
      price_gte: 0,
      price_lte: 4000
    }
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    for (const [key, value] of Object.entries(this.urlParameters)) {
      this.url.searchParams.set(key, value);
    }

    this.sortableTable = new SortableTable(header, {
      url: this.url,
      isSortLocally: false
    });

    this.doubleSlider = new DoubleSlider({
      min: this.urlParameters.price_gte,
      max: this.urlParameters.price_lte
    });

    this.subElements.sortableTable.append(this.sortableTable.element);
    this.subElements.sliderContainer.append(this.doubleSlider.element);

    this.initEventListeners();
    return this.element;
  }

  update() {

  }

  initComponents() {
    // const productId = '101-planset-lenovo-yt3-x90l-64-gb-3g-lte-cernyj';
    //
    // this.components.productFrom = new ProductForm(productId);
  }

  getTemplate() {
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
      <div data-elem="productsContainer" class="products-list__container">
        <div class="sortable-table" data-element="sortableTable"></div>
      </div>
      </div>`;
  }
  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }
  async renderComponents() {
    for (const [key, value] of Object.entries(this.urlParameters)) {
      this.url.searchParams.set(key, value);
    }
    this.sortableTable.url = this.url;
    await this.sortableTable.reRenderBody();
    this.subElements.sortableTable.append(this.sortableTable.element);
  }
  initEventListeners () {
    document.addEventListener('table-update', async() => {
      await this.sortableTable.reRenderBody();
    });
    this.subElements.filterStatus.addEventListener('change', (event) => {
      const statusParameter = event.target.value;
      this.urlParameters._start = 0;
      this.urlParameters._end = 30;
      if([0, 1].includes(parseInt(statusParameter))) {
        this.urlParameters.status = event.target.value;
      } else {
        delete this.urlParameters.status;
      }
      this.renderComponents()
    });
    this.subElements.filterName.addEventListener('keyup', (event) => {
      const titleLike = event.target.value;
      this.urlParameters._start = 0;
      this.urlParameters._end = 30;
      this.urlParameters.title_like = titleLike;

      this.renderComponents()
    })
    this.subElements.sliderContainer.addEventListener('range-select', event => {
      const { from, to } = event.detail;
      this.urlParameters.price_gte = from;
      this.urlParameters.price_lte = to;

      this.renderComponents()
    });
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.sortableTable.destroy();
    this.doubleSlider.destroy();
  }
}
