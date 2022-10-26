import Categories from '../../components/categories';
import fetchJson from '../../utils/fetch-json';

export default class CategoriesPage {
  element;
  subElements = {};
  components = {};
  categoriesData = [];

  async loadCategoriesData() {
    try {
      const data = await fetchJson(
        `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
      );

      return data;
    } catch (error) {
      const notification = new NotificationMessage(error, {
        duration: 2000,
        type: 'error'
      });
      notification.show();
    }
  }

  get template() {
    return `<div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Product categories</h1>
        </div>
        <p>Подкатегории можно перетаскивать, 
        меняя их порядок внутри своей категории.</p>
        
        <!-- Categories component -->
        <div data-element="categoriesContainer"></div>
      </div>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.categoriesData = await this.loadCategoriesData();

    this.renderCategories();

    return this.element;
  }

  renderCategories() {
    this.categoriesData
      .map(item => new Categories(item))
      .forEach(item => {
        this.subElements.categoriesContainer.append(item.element);
      });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    this.components.categoriesContainer.forEach(item => item.destroy());
  }
}
