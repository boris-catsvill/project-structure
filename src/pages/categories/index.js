import fetchJSON from '../../utils/fetch-json'
import CategoriesList from '../../components/categories';

export default class Page {
  subElements = {};
  components = {};
  categories = {};

  async render() {
    this.element = document.createElement('div');
    this.element.classList.add('categories');
    this.element.innerHTML = `
      <div class="content__top-panel">
        <h1 class="page-title">Products Categories</h1>
      </div>
      <div data-element="categoriesContainer"></div>
    `
    this.subElements = this.getSubElements(this.element);
    const categories = await this.fetchCategories();
    this.renderCategories(categories);
    return this.element;
  }

  async fetchCategories() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight')
    url.searchParams.set('_refs', 'subcategory');
    return fetchJSON(url);
  }

  renderCategories(categories) {
    const categoriesContainer = this.subElements.categoriesContainer;
    categories.forEach(category => {
      const item = new CategoriesList({
        category
      });
      this.categories[category.id] = item;
      categoriesContainer.append(item.element);
    });
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    Object.values(this.categories).forEach(category => category.destroy());
    this.remove();
  }
}
