import Categories from "../../components/categories/index.js";
import fetchJson from "../../utils/fetch-json";

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  components = [];
  subElements = {};

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const components = await this.initComponents();
    this.renderComponents(components);
    this.components = components;

    return this.element;
  }

  async initComponents() {
    const categoriesHtmlCollection = [];
    const categoriesData = await this.fetchCategoriesData();

    for (const category of categoriesData) {
      categoriesHtmlCollection.push(new Categories(category))
    }

    return categoriesHtmlCollection
  }

  renderComponents(components) {
    const { categoriesContainer } = this.subElements;

    for (const component of components) {
      categoriesContainer.append(component.element)
    }
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async fetchCategoriesData () {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url)
  }

  getTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Категории товаров</h2>
        </div>
        <div data-element="categoriesContainer"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of this.components) {
      component.destroy();
    }
  }
}
