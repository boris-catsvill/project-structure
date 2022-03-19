import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  currentFilter = {
    title_like: null,
    price_gte: 0,
    price_lte: 4000,
    status: null
  }

  async initComponents () {
    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products?_embed=subcategory.category&_sort=title&_order=asc',
      isSortLocally: false,
      step: 30,
      start: 0,
      end: 30,
      rowWrapper: (item, callback) => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${callback}
          </a>
        `;
      }
    });

    const doubleSlider = new DoubleSlider({ min: 0, max: 4000 });

    this.components.sortableTable = sortableTable;
    this.components.doubleSlider = doubleSlider;
  }

  get template () {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>

      <div class="content-box content-box_small">
        <form class="form-inline" data-element="filterForm">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" name="filterName" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="doubleSlider">
            <label class="form-label">Цена:</label>
            <!-- slider component -->
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" name="filterStatus" data-element="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
      </div>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
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
    this.initEventListeners();

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

  getFilterData () {
    let baseURL = 'api/rest/products?_embed=subcategory.category&_sort=title&_order=asc';

    Object.entries(this.currentFilter).forEach(([key, value]) => {
      if (value !== null) {
        baseURL += `&${key}=${value}`;
      }
    });

    const sortableTable = new SortableTable(header, {
      url: baseURL,
      isSortLocally: false,
      step: 30,
      start: 0,
      end: 30,
      rowWrapper: (item, callback) => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${callback}
          </a>
        `;
      }
    });

    this.components.sortableTable.destroy();
    
    this.components.sortableTable = sortableTable;
    this.subElements.sortableTable.append(sortableTable.element);
  }

  initEventListeners () {
    this.components.doubleSlider.element.addEventListener('range-select', event => {
      const { from, to } = event.detail;

      this.currentFilter.price_gte = from;
      this.currentFilter.price_lte = to;
      
      this.getFilterData();
    });

    this.subElements.filterForm.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(this.subElements.filterForm);

      this.currentFilter.title_like = formData.get('filterName');
      this.currentFilter.status = formData.get('filterStatus') === '' ? null : Number(formData.get('filterStatus'));

      this.getFilterData();
    });

    this.subElements.filterName.addEventListener('input', event => {
      const newValue = event.target.value.trim();

      this.currentFilter.title_like = newValue ? newValue : null;
      this.getFilterData();
    });

    this.subElements.filterStatus.addEventListener('change', event => {
      const newValue = event.target.value;

      this.currentFilter.status = newValue === '' ? null : Number(newValue);
      this.getFilterData();
    });
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
