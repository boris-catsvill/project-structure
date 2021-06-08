/* eslint-disable no-undef */
import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  categories = [];

  element;

  onCategoryClick = event => {
    if (event.target.classList.contains('category__header')) {
      const categoryElement = event.target.closest('.category');
      const openedCategoryClass = 'category_open';

      if (categoryElement.classList.contains(openedCategoryClass)) {
        categoryElement.classList.remove(openedCategoryClass);
      } else {
        categoryElement.classList.add(openedCategoryClass);
      }
    }
  };

  constructor() {

  }

  get template() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-elem="categoriesContainer">
          ${this.categories.map(category => this.getCategoryTemplate(category)).join('')}
        </div>
      </div>
    `;
  }

  getCategoryTemplate({ id, title, subcategories }) {
    return `
      <div class="category category_open" data-id="${id}">
        <header class="category__header">${title}</header>
        <div class="category__body">
          <div class="subcategory-list">
            <ul class="sortable-list">
              ${subcategories.map(subCategory => this.getSubCategoryTemplate(subCategory)).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  getSubCategoryTemplate({ id, title, count }) {
    return `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${id}">
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>
    `;
  }

  getCategories() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return fetchJson(url);
  }

  async render() {
    this.categories = await this.getCategories();
    this.element = this.getElementFromTemplate(this.template);

    this.initEventListeners();

    return this.element;
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  initEventListeners() {
    this.element.querySelector('[data-elem=categoriesContainer]').addEventListener('pointerdown', this.onCategoryClick)
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
