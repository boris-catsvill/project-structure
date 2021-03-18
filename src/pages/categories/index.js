import fetchJson from '../../utils/fetch-json';
const BACKEND_URL = 'https://course-js.javascript.ru';
import Categories from "../../components/categories";

export default class Page {
  element;
  categories = [];
  components = [];

  async getData() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  initComponents(categories) {
    const tempList = [];

    categories.map(item => {
      const component = new Categories(item);
      tempList.push(component);
    });

    this.components = tempList;
  }

  renderComponents() {
    const categoryList = this.element.querySelector('[data-element="categoriesContainer"]');

    this.components.map(category => categoryList.append(category.element));
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div>
        <div class="categories">
          <div class="content__top-panel">
            <h1 class="page-title">Категории товаров</h1>
          </div>
          <div data-element="categoriesContainer"></div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;

    this.categories = await this.getData();
    this.initComponents(this.categories);
    this.renderComponents();

    return this.element;
  }

  remove() {
      this.element.remove();
  }

  destroy() {
      this.remove();

      for (const component of Object.values(this.components)) {
          component.destroy();
      }
  }
}
