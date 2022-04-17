import CategoriesList from '../../components/categories/index.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async getDataForCategoriesContainer() {
    const CATEGORIES = `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`;

    return await fetchJson(CATEGORIES);
  }

  async initComponents() {
    const categories = await this.getDataForCategoriesContainer();

    const temp = {};

    categories.forEach((id, index) => {
      temp[index] = new CategoriesList(categories[index]);
      this.components.categoriesContainer = temp;
    });
  }

  get template() {
    return `<div class="categories">
      <div class="content__top-panel">
        <h2 class="page-title">Категории товаров</h2>
       </div>
      <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
      <div data-element="categoriesContainer">

      <!-- categoriesContainer -->

      </div>
    </div>
		`;
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
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const element = this.components[component];

      for (const key in Object.keys(element)) {
        root.append(element[key].element);
      }
    });
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    for (const components of Object.values(this.components)) {
      Object.values(components).forEach(component => component.destroy());
    }
  }
}
