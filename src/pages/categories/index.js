import Categories from '../../components/categories';
import fetchJson from '../../utils/fetch-json';

export default class CategoriesPage {
  element;
  subElements = {};
  components = {};

  async initComponents() {
    const categoriesData = await fetchJson(
      `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
    );

    const categoriesContainer = categoriesData.map(item => new Categories(item));

    this.components.categoriesContainer = categoriesContainer;
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

    await this.initComponents();

    this.renderComponents();

    return this.element;
  }

  renderComponents() {
    this.components.categoriesContainer.forEach(item =>
      this.subElements.categoriesContainer.append(item.element)
    );
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
