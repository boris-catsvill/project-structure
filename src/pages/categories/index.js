import Categories from '@/components/categories/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);

    await this.initComponent();
    this.renderComponent();

    return this.element;
  }

  get template() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h2 class="page-title">Product categories</h2>
        </div>

        <div data-element="categories"></div>
      </div>
    `;
  }

  async initComponent() {
    const categories = new Categories();

    await categories.render();

    this.components = {
      categories
    };
  }

  renderComponent() {
    for (const [key, component] of Object.entries(this.components)) {
      this.subElements[key].append(component.element);
    }
  }

  destroyComponents() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.destroyComponents();
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
