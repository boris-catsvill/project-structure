import SortableTable from '../../../components/sortable-table/index.js';
import header from './header.js';

export default class Page {
  element = {};
  subElements = {};
  components = {};
  controller = new AbortController();

  async render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;

    this.getSubElements();
    this.initComponents();
    this.appendComponents();

    return this.element;
  }

  initComponents() {
    this.components['productsContainer'] = new SortableTable(header, {
      url: 'api/rest/products'
    });
  }

  appendComponents() {
    for (const [name, instance] of Object.entries(this.components)) {
      if (Object.hasOwn(this.subElements, name)) {
        this.subElements[name].append(instance.element);
      }
    }
  }

  getSubElements() {
    for (const item of this.element.querySelectorAll('[data-element]')) {
      this.subElements[item.dataset.element] = item;
    }
  }
  getTemplate() {
    return `<div class="products-list">
    <div class="content__top-panel">
      <h1 class="page-title">Товары</h1>
      <a href="/products/add" class="button-primary">Добавить товар</a>
    </div>

    <div data-element="productsContainer" class="products-list__container"></div>
    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder"><div>
    <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
    <button type="button" class="button-primary-outline">Очистить фильтры</button>
    </div>`;
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    this.controller.abort();

    for (const instance of Object.values(this.components)) {
      if (Object.hasOwn(instance, 'destroy')) {
        instance.destroy();
      }
    }
    this.components = null;
  }
}
