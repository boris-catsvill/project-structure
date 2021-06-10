/* eslint-disable no-undef */
import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';

export default class Page {
  element;
  components = {};
  subElements = {};

  constructor() {
    this.charts = { orders: 'orders', sales: 'sales', customers: 'customers' };
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
              <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
            </div>
            <div class="form-group" data-elem="sliderContainer">
              <label class="form-label">Цена:</label>
              <!-- Double slider -->
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
        <div data-elem="productsContainer" class="products-list__container"><!-- Table --></div>
      </div>
    `;
  }

  initComponents() {
    this.initTable();
    this.initDoubleSlider();

    Object.entries(this.components).forEach(([key, value]) => this.subElements[key] = value.element);
  }

  renderComponents() {
    this.element.querySelector('[data-elem=productsContainer]').append(this.subElements['sortableTable']);
    this.element.querySelector('[data-elem=sliderContainer]').append(this.subElements['slider']);
  }

  render() {
    this.element = this.getElementFromTemplate(this.template);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  initTable() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');

    this.components['sortableTable'] = new SortableTable(header, {
      url,
      sorted: {
        id: 'title',
        order: 'asc'
      },
      clickableRow: { isRowClickable: true, href: '/products/'}
    });
  }

  initDoubleSlider() {
    this.components['slider'] = new DoubleSlider({ min: 0, max: 4000 });
  }

  initEventListeners() {}

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    Object.values(this.components).forEach(component => component.destroy());
  }
}
