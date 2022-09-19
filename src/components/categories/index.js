import fetchJson from '../../utils/fetch-json.js';
import SortableList from '../sortable-list/index.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Categories {
  subElements = {};

  onClick = event => {
    if (event.target.classList.contains('category__header')) {
      const category = event.target.closest('.category');

      category.classList.toggle('category_open');
    }
  };

  constructor() {
    this.render();
  }

  initEventListeners() {
    this.element.addEventListener('click', this.onClick);
  }

  getTemplate() {
    const div = document.createElement('div');

    div.innerHTML = `
        <div class="categories">
          <div class="content__top-panel">
            <h1 class="page-title">Категории товаров</h1>
          </div>
          <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
          <div data-elem="categoriesContainer">
          </div>
        </div>`;

    this.element = div.firstElementChild;

    this.subElements.categoriesContainer = this.element.querySelector('[data-elem]');
  }

  async loadCategories() {
    try {
      const urlCategories = new URL('api/rest/categories', BACKEND_URL);

      urlCategories.searchParams.set('_sort', 'weight');
      urlCategories.searchParams.set('_refs', 'subcategory');

      const categories = await fetchJson(urlCategories);

      this.categories = categories;
    } catch (error) {
      console.log(error);
    }
  }

  categoryFill(data) {
    for (const good of data) {
      const { title, id, subcategories } = good;
      const div = document.createElement('div');

      div.innerHTML = `
        <div class="category category_open" data-id="${id}">
          <header class="category__header">
            ${title}
          </header>
          <div class="category__body">
            <div class="subcategory-list">
            </div>
          </div>
        </div>`;

      const ul = this.subCategoryFill(subcategories);

      const category = div.firstElementChild;
      category.querySelector('.subcategory-list').append(ul);

      this.subElements.categoriesContainer.append(div.firstElementChild);
    }
  }

  subCategoryFill(subData) {
    const items = subData.map(({ id, title, count }) => {
      const div = document.createElement('div');

      div.innerHTML = `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
            data-id="${id}">
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
        </li>`;

      return div.firstElementChild;
    });

    this.subElements.sortableList = new SortableList({ items });

    return this.subElements.sortableList.element;
  }

  async render() {
    try {
      this.getTemplate();

      await this.loadCategories();

      this.categoryFill(this.categories);
      this.initEventListeners();
    } catch (error) {
      console.log(error);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.subElements.sortableList.destroy();
    this.remove();
    this.element = null;
  }
}
