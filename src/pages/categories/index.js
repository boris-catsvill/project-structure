import fetchJson from '../../utils/fetch-json.js';
import SortableList from "../../components/sortable-list";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  categoriesNSubcategories;

  constructor() {
    this.categoriesNSubcategoriesUrl = new URL(`api/rest/categories`, BACKEND_URL);
    this.render();
  }

  get template() {
    return `<div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
      <div data-elem="categoriesContainer">
          </div>
        </div>`;
  }

  renderCategories(data) {
    return Object.values(data)
      .map(category => {
        const element = document.createElement('div');
        element.className = "category category_open";
        element.dataset.id = category.id;

        element.innerHTML = `<header class="category__header">
            ${category.title}
          </header>
          <div class="category__body">
            <div class="subcategory-list">
            </div>
          </div>`;

        const subcategoryList = element.querySelector('.subcategory-list');

       const subcategoryElement = new SortableList({
      items: category.subcategories
        .map(subcategory => this.renderSubcategory(subcategory))
    });
        subcategoryList.append(subcategoryElement.element);

        this.categoriesContainer.append(element);
      });
  }

  renderSubcategory(subcategory) {
    const element = document.createElement('li');
    element.className = "categories__sortable-list-item";
    element.dataset.grabHandle = "";
    element.dataset.id = subcategory.id;
    element.innerHTML
      = `<strong>${subcategory.title}</strong>
      <span><b>${subcategory.count}</b> products</span>`
    return element;
  }

  async render() {
    this.categoriesNSubcategories = await this.loadCategoriesNSubcategories();

    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.categoriesContainer = this.element.querySelector('[data-elem="categoriesContainer"]');
    this.renderCategories(this.categoriesNSubcategories);

    this.initEventListeners();

    return this.element;
  }

  loadCategoriesNSubcategories() {
    this.categoriesNSubcategoriesUrl.searchParams.set('_sort', 'weight');
    this.categoriesNSubcategoriesUrl.searchParams.set('_refs', 'subcategory');
    return fetchJson(this.categoriesNSubcategoriesUrl);
  }

  initEventListeners() {
    //this.element.addEventListener('date-select', this.onDateSelect);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
