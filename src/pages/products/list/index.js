// import ProductForm from "../../../components/product-form";
import fetchJson from '../../../utils/fetch-json.js';
import vars from '../../../utils/vars.js';

import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from "../../../components/double-slider/index.js"

const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0].url}">
          </div>
        `;
    }
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'quantity',
    title: 'Quantity',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'subcategory',
    title: 'Category',
    sortable: true,
    sortType: 'string',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data.title}
        </div>`;
    }
  },
  {
    id: 'price',
    title: 'Price',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
    }
  },
];

export default class Page {
  element;
  subElements = {};
  components = {};
  minPrice = 0;
  maxPrice = 4000;
  url = new URL(vars.API_REST_PRODUCTS, vars.BACKEND_URL);

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  async updateComponents(from, to) {
    const data = await this.loadData(from, to);

    this.components.productsTable.update(data);
  }

  loadData(from, to) {
    this.url.searchParams.set('_start', '0');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('_embed', 'subcategory.category');
    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);

    return fetchJson(this.url);
  }

  initComponents() {
    const doubleSlider = new DoubleSlider({min: this.minPrice, max: this.maxPrice});

    const productsTable = new SortableTable(header,
      {
          url: `${vars.API_REST_PRODUCTS}?_start=0&_end=30&_embed=subcategory.category&_order=asc&_sort=title`,
          isSortLocally: false,
          sorted: {id: 'title', order: 'asc'}
      });
    // const productId = '101-planset-lenovo-yt3-x90l-64-gb-3g-lte-cernyj';

    // this.components.productFrom = new ProductForm(productId);

    this.components = {
      doubleSlider,
      productsTable
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    });
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
        <div data-element="productsTable" class="products-list__container"></div>
      </div>`;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  initEventListeners() {
    this.components.doubleSlider.element.addEventListener('range-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
  }
}
