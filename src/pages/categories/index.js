import Categories from '../../components/categories';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.initComponents();
    this.renderComponents();

    this.getSubElements();

    return this.element;
  }

  initComponents() {
    this.components.category = new Categories('api/rest/categories?_sort=weight&_refs=subcategory');
  }

  async renderComponents() {
    const categoryElement = await this.components.category.render();
    this.subElements.categoriesContainer.append(categoryElement);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  }

  get template() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Categories</h1>
        </div>
        <p>Subcategories are draggable</p>
        <div data-element="categoriesContainer"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Object.keys(this.components).forEach(componentName => this.components[componentName].destroy());
  }
}
