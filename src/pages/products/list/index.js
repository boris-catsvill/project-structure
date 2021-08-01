import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import tableHeader from "../table-header.js";
import fetchJson from "../../../utils/fetch-json";

export default class Page {
  element;
  subElements = {};
  components = {};
  filters = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initComponents();
    await this.renderComponents();

    this.initEventListeners();

    return this.element;
  }

  addFilter = event => {

    switch(event.type){
      case 'range-select':
        this.filters.price_gte = event.detail.from;
        this.filters.price_lte = event.detail.to;
      break;
      case 'keyup':
        this.filters.title_like = event.target.value;
        break;
      case 'change':
        this.filters.status = event.target.value;
        break;
      case 'reset-filters':
        this.filters = {};
        break;
    }

    this.updateTable();
  }

  async updateTable(){
    const url = new URL('api/rest/products?_embed=subcategory.category', process.env.BACKEND_URL);

    for (const key in this.filters) {
      url.searchParams.set(key, this.filters[key]);
    }

    const data = await fetchJson(url);
    this.components.sortableTable.renderRows(data);
  };

  get template(){
    return `
      <div class="products-list">

        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>


        <div class="content-box content-box_small">
          <form data-element="filterForm" class="form-inline">

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

        <div data-element="sortableTable" class="products-list__container"></div>
      </div>
    `;
  }

  initComponents() {
    const url = 'api/rest/products?_embed=subcategory.category';
    const sortableTable = new SortableTable(tableHeader, {
      url: url,
      isSortLocally: false,
      step: 30,
      start: 0,
    });

    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000,
    });

    this.components.sortableTable = sortableTable;
    this.components.doubleSlider = doubleSlider;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListeners(){
    this.subElements.filterStatus.addEventListener('change', this.addFilter);
    this.subElements.filterName.addEventListener('keyup', this.addFilter);
    this.subElements.doubleSlider.addEventListener('range-select', this.addFilter);
    this.subElements.sortableTable.addEventListener('reset-filters', this.addFilter);


  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
