import DoubleSlider from '../../../components/double-slider/index';
import SortableTable from '../../../components/sortable-table/index';
import productsHeader from './products-header';

export default class Page {
  subElements = {};
  components = {};

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.components = this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
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
            <label class="form-label">Поиск по:</label>
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
    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000,
      formatValue: value => `$${value}`
    });

    const sortableTable = new SortableTable(productsHeader, {
      url: 'api/rest/products?_embed=subcategory.category',
      sorted: {
        id: 'title',
        order: 'asc'
      }
    });

    return {
      doubleSlider,
      sortableTable
    };
  }

  initEventListeners() {}

  renderComponents() {
    for (const componentName of Object.keys(this.components)) {
      const root = this.subElements[componentName];
      const element = this.components[componentName].element;

      root.append(element);
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};

    for (const component in this.components) {
      this.components[component].destroy();
    }

    this.components = {};
  }
}
