import SortableTable from '../../../components/sortable-table';
import headerConfig from '../bestsellers-header.js';
import ProductForm from '../../../components/product-form';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.initComponents();
    this.initEventListeners();
    return this.element;
  }
  getTemplate() {
    return `
    <div class="products-list">
    <div class="content__top-panel">
    <h1 class="page-title">Товар</h1>
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
    <div class="range-slider">
    <span data-element="from"></span>
    <div data-element="slider" class="range-slider__inner">
    <span data-element="progress" class="range-slider__progress"></span>
    <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
    <span data-element="thumbRight" class="range-slider__thumb-right"></span>
    </div>
    <span data-element="to"></span>
    </div>
    </div>
    <div class="form-group">
    <label class="form-label">Статус:</label>
    <select class="form-control" data-element="filterStatus">
    <option value="" selected="">Любой</option>
    <option value="1">Активен</option>
    <option value="0">неактивен</option>
    </select>
    </div>
    </form>
    </div>
    <div data-element="productsContainer" class="products-list__container"></div>
    </div>
    `;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }
  initComponents() {
    this.getSortableTable();
  }
  getSortableTable() {
    const products = (this.components.products = new SortableTable(headerConfig, {
      url: `api/rest/products?_embed=subcategory.category`,
      isSortLocally: true
    }));
    this.subElements.productsContainer.append(products.element);
  }

  initEventListeners() {}
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    console.log(this);
  }
}
