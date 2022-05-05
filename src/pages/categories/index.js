import fetchJson from "../../utils/fetch-json";
import Category from "../../components/categories/index.js";
import NotificationMessage from "../../components/notification";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  categoriesData = [];

  getTemplate() {
    return `<div class="categories">
              <div class="content__top-panel">
                <h1 class="page-title">Products categories</h1>
              </div>
              <p>Subcategories can be dragged and dropped to change their order within their category.</p>
              <div data-element="categoriesContainer"></div>
            </div>`;
  }

  initComponents() {
    for (const item of this.categoriesData) {

      this.components[item.id] = new Category(item, new URL('api/rest/subcategories', BACKEND_URL));
      const elem = this.components[item.id].render();
      this.subElements.categoriesContainer.append(elem);
    }
  }

  getSubElements() {
    const elements = this.element.querySelectorAll(`[data-element]`);
    const result = {};

    for (const element of elements) {
      result[element.dataset.element] = element;
    }

    return result;
  }

  addEvenListeners() {
    this.element.addEventListener('sortable-list-reorder', (event) => {
      const notification = new NotificationMessage('Category order saved', {
        duration: 2000,
        type: 'notification_success',
      });

      notification.show(this.element);
    });
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.categoriesData = await this.loadCategoriesData();
    this.subElements = this.getSubElements();
    this.initComponents();
    this.addEvenListeners();

    return this.element;
  }

  async loadCategoriesData() {
    const url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
    return await fetchJson(url);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
    this.element = null;
  }
}
