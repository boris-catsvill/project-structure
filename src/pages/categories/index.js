import Categories from "../../components/categories";

export default class Page {
  element;
  subElements = {};
  components = {};

  initComponents() {
    const categoriesContainer = new Categories();

    this.components = {
      categoriesContainer,
    }
  }

  get template () {
    return `
      <div>
        <div class="categories">
          <div class="content__top-panel">
            <h1 class="page-title">Products' categories</h1>
          </div>
          <div data-element="categoriesContainer"></div>
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

    await this.components.categoriesContainer.render(this.element.querySelector('[data-element]'));

    this.renderComponents();

    return this.element;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    })
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
