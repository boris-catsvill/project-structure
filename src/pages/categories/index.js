import fetchJson from '../../utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL)
  data = [];

  async render() {
    this.data = await this.loadData();
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
    console.log(this.element)

    return this.element;
  }

  getTemplate() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
      <div data-element="categoriesContainer">
        ${this.getCategoriesList(this.data)}
      </div>
    </div>`
  }

  async loadData() {
    const data = await fetchJson(this.url);

    return data;
  }

  getCategoriesList(data) {
    return data.map(category => {
      return`
      <div class="category category_open" data-id="${category.item}">
        <header class="category__header">
          ${category.title}
        </header>

        <div class="category__body">
          <div class="subcategory-list">
            <ul class="sortable-list">
              ${this.getSubCategories(category.subcategories)}
            </ul>
          </div>
        </div>

      </div>`
    }).join('');
  }

  getSubCategories(elem) {
    return elem.map(subcategory => {
      return `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${subcategory.id}">
        <strong>${subcategory.title}</strong>
        <span><b>${subcategory.count}</b> products</span>
      </li>`
    }).join('');
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}