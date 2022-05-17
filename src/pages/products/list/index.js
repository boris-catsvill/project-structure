import SortableTable from "../../../components/sortable-table";
import fetchJson from "../../../utils/fetch-json";
import DoubleSlider from "../../../components/double-slider";

import header from "../../dashboard/bestsellers-header";
import escapeHtml from "../../../utils/escape-html";


const BACKEND_URL = 'https://course-js.javascript.ru/';
export default class Page {
  subElements = {};
  components = {};


  filterName = async event => {
    this.input = escapeHtml(event.target.value);
    this.components.sortableTable.input = escapeHtml(event.target.value);

    this.urlProducts.searchParams.set('title_like', this.input);
    const data = await this.loadData();
    this.components.sortableTable.addRows(data);
  }

  filterStatus = async event => {
    this.status = event.target.value;

    this.components.sortableTable.status = event.target.value;

    this.urlProducts.searchParams.set('status', this.status);
    const data = await this.loadData();
    this.components.sortableTable.addRows(data);
  }

  onProductForm = event => {
    history.pushState({}, '', '/products/add');
    history.go();
  }



  urlProducts = new URL('api/rest/products?_embed=subcategory.category', BACKEND_URL);
  constructor() {
    this.to = '';
    this.from = '';
    this.status = '';
    this.input = '';
  }
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {

    const slider = new DoubleSlider();

    const sortableTable = new SortableTable(header, {
      isSortLocally: false,
      url: `api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30`
    });


    this.components = {
      sortableTable,
      slider
    }
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
      root.append(element);
    });

    this.toggleProgressbar();
  }

  toggleProgressbar() {
    const element = document.querySelector('.progress-bar');
    return element.style.display === '' ? element.style.display = 'none' : element.style.display = 'none';
  }


  initEventListeners() {

    const { filterName, filterStatus, addProduct } = this.subElements;

    filterName.addEventListener('input', this.filterName);
    filterStatus.addEventListener('change', this.filterStatus);
    addProduct.addEventListener('pointerdown', this.onProductForm);

    document.addEventListener('reset-filter', async event => {
      filterName.value = '';
      filterStatus.value = 1;
      this.components.slider.min = 0;
      this.components.slider.min = 4000;



      this.urlProducts.searchParams.delete('price_gte');
      this.urlProducts.searchParams.delete('price_lte');
      this.urlProducts.searchParams.delete('status');
      this.urlProducts.searchParams.delete('title_like');

      const data = await this.loadData();
      this.components.sortableTable.addRows(data);

    })


    document.addEventListener('range-select', async event => {
      this.toggleProgressbar();
      const { from, to } = event.detail;

      this.from = from;
      this.to = to;

      this.components.sortableTable.rangeSelect = {
        from: from,
        to: to,
      }

      this.urlProducts.searchParams.set('price_gte', this.from);
      this.urlProducts.searchParams.set('price_lte', this.to);

      const data = await this.loadData();
      this.components.sortableTable.addRows(data);
      this.toggleProgressbar();
    })
  }

  async loadData() {
    this.urlProducts.searchParams.set('_sort', 'title');
    this.urlProducts.searchParams.set('_order', 'asc');
    this.urlProducts.searchParams.set('_start', '0');
    this.urlProducts.searchParams.set('_end', '30');

    const data = await fetchJson(this.urlProducts);
    return data;
  }


  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const item of elements) {
      this.subElements[item.dataset.element] = item;
    }

    return this.subElements;
  }


  removeEventListeners() {
    this.removeEventListeners('input', this.filterName);
    this.removeEventListeners('change', this.filterStatus);
    this.removeEventListeners('pointerdown', this.onProductForm);
  }


  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  getTemplate() {
    return `<div class="products-list">
    <div class="content__top-panel">
      <h1 class="page-title">Products</h1>
      <a href="/products/add" class="button-primary" data-element="addProduct">Добавить товар</a>
    </div>
    <div class="content-box content-box_small">
      <form class="form-inline" data-element="productForm">
        <div class="form-group">
          <label class="form-label">Сортировать по:</label>
          <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
        </div>
        <div class="form-group" data-element="slider">
          <label class="form-label">Цена:</label>
          <!-- slider component -->
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
       <div data-element="sortableTable">
      </div>
    </div> 
  </div>`
  }

}
