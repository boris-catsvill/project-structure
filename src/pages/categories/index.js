import fetchJson from '../../utils/fetch-json.js';
import vars from '../../utils/vars.js';

import Category from '../../components/categories/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL(vars.API_REST_CATEGORIES, vars.BACKEND_URL);

  loadData() {
    this.url.searchParams.set('_sort', 'weight');
    this.url.searchParams.set('_refs', 'subcategory');

    return fetchJson(this.url);
  }

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
            <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-element="categoriesContainer"></div>
      </div>
      `;
  }

  async renderCategories() {
    const root = this.subElements.categoriesContainer;

    const data = await this.loadData();
    for (let item of data) {
        const categoriesItem = new Category(item);
        root.append(categoriesItem.element);
    }

  }

  initEventListeners() {
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.renderCategories();
    this.initEventListeners();

    return this.element;
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
