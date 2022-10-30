import Categories from '../../components/categories';

export default class CategoriesPage {
  element;
  subElements = {};

  // constructor() {
  //   this.render();
  // }

  initListeners() {}

  removeListeners() {}

  renderComponents() {
    const { categoriesComponent } = this.subElements;

    this.categoriesComponentElement = new Categories();

    categoriesComponent.append(this.categoriesComponentElement.element);
  }

  get template() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
      
      <div data-element="categoriesComponent">
        <!-- categories component -->
      </div>
    </div>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.renderComponents();
    this.initListeners();

    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element; 
      result[name] = subElement;
    }
    console.log(result);
    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.removeListeners();
  }

  destroy() {
    this.element.remove();
    this.removeListeners();
  }
}