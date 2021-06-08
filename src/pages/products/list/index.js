import SortableTable from "../../../components/sortable-table";
import DoubleSlider from "../../../components/double-slider";
import header from "./products-header.js";

export default class Page {
  subElements = {};
  components = {};

  onChangeFilterName = event => {
    this.urlProducts.searchParams.delete('title_like');

    this.updateComponents({
      title: event.target.value
    });
  };

  onChangeFilterRange = event => {
    this.urlProducts.searchParams.delete('price_gte');
    this.urlProducts.searchParams.delete('price_lte');

    this.updateComponents({
      priceGte: event.detail.from,
      priceLte: event.detail.to
    });
  };

  onChangeFilterStatus = event => {
    this.urlProducts.searchParams.delete('status');

    this.updateComponents({
      status: event.target.value
    });
  };

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);


    const components = this.initComponents();
    this.renderComponents(components);
    this.components = components;

    this.addEventListeners();

    return this.element;
  }

  initComponents() {
    this.urlProducts = new URL('/api/rest/products', process.env.BACKEND_URL);
    this.urlProducts.searchParams.set('_embed', 'subcategory.category');

    const sortableTable = new SortableTable(header, {
      url: this.urlProducts,
      isSortLocally: false,
      isInfinityScroll: true,
      sorted: {
        id: 'title',
        order: 'asc'
      }
    });

    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 10000
    });

    return {
      doubleSlider,
      sortableTable
    };
  }

  renderComponents(components) {
    const keysComponents = Object.keys(components);

    keysComponents.forEach(component => {
      const root = this.subElements[component];
      const { element } = components[component];

      root.append(element);
    });
  }

  updateComponents({
    title = null,
    priceGte = null,
    priceLte = null,
    status = null
  } = {}) {
    const { sortableTable } = this.components;

    if (title) this.urlProducts.searchParams.set('title_like', title);
    if (priceGte) this.urlProducts.searchParams.set('price_gte', priceGte);
    if (priceLte) this.urlProducts.searchParams.set('price_lte', priceLte);
    if (status) this.urlProducts.searchParams.set('status', status);

    sortableTable.update(this.urlProducts)
  }

  addEventListeners() {
    const { filterName, filterStatus, doubleSlider } = this.subElements;

    filterName.addEventListener('change', this.onChangeFilterName);
    filterStatus.addEventListener('input', this.onChangeFilterStatus);
    doubleSlider.addEventListener('range-select', this.onChangeFilterRange)
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
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
              <input class="form-control" type="text" placeholder="Название товара" data-element="filterName">
            </div>
            <div class="form-group" data-element="doubleSlider">
              <label class="form-label">Цена:</label>
            </div>
            <div class="form-group">
              <label class="form-label">Статус:</label>
              <select class="form-control" data-element="filterStatus">
                <option value selected>Любой</option>
                <option value="1">Активный</option>
                <option value="0">Неактивный</option>
              </select>
            </div>
          </form>
        </div>
        <div class="products-list__container" data-element="sortableTable"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
