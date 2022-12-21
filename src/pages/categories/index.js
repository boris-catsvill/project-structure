import fetchJson from './../../utils/fetch-json.js';
import escapeHtml from "../../utils/escape-html";

export default class Categories {
  constructor() {
    this.components = {};
    this.init();
  }
  async init() {
    await this.render();
  }

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.categories = await fetchJson('https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory');
    this.subElements.categories.innerHTML = this.getTemplateParentCategories();

    return this.element;
  }

  getTemplate() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
      <div data-element="categories">
        <!-- categories component -->
      </div>
    </div>`;
  }

  getTemplateParentCategories() {
    return this.categories
      .map(item => {
        return `
          <div class="category category_open" data-id="${item.id}">
            <header class="category__header">${escapeHtml(item.title)}</header>
            <div class="category__body">
              <div class="subcategory-list" data-element="subcategoryList">
                 ${this.getTemplateChildrenCategories(item.subcategories)}
              </div>
            </div>
          </div>
        `;
      }).join("");
  }
  getTemplateChildrenCategories(subcategories) {
    return subcategories
      .map(item => {
        return `
            <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${item.id}">
                <strong>${escapeHtml(item.title)}</strong>
                <span><b>${item.count}</b> products</span>
            </li>
            `;
      }).join("");
  }

  initEventListeners () {

  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

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
    // NOTE: удаляем обработчики событий, если они есть
  }
}
