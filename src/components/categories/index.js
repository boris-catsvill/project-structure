import fetchJson from '../../utils/fetch-json.js';
import SortableList from "../../components/sortable-list";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Categories {
  element;
  categoriesNSubcategories;

  onHeaderClick = event => {
    const category = event.target.closest('.category');

    if (!category) {
      return;
    }

    category.classList.toggle('category_open');
  };

  constructor(url) {
    this.categoriesNSubcategoriesUrl = new URL(url, BACKEND_URL);
    this.render();
  }

  get template() {
    return `<div data-elem="categoriesContainer">
          </div>`;
  }

  async renderCategories() {
    this.categoriesNSubcategories = await this.loadCategoriesNSubcategories();

    return Object.values(this.categoriesNSubcategories)
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

        this.element.append(element);
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

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.renderCategories();

    this.initEventListeners();

    return this.element;
  }

  loadCategoriesNSubcategories() {
    this.categoriesNSubcategoriesUrl.searchParams.set('_sort', 'weight');
    this.categoriesNSubcategoriesUrl.searchParams.set('_refs', 'subcategory');
    return fetchJson(this.categoriesNSubcategoriesUrl);
  }

  initEventListeners() {
    this.element.addEventListener('click', this.onHeaderClick);
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
