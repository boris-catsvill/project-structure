import Categories from '../../components/categories';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    return this.element;
  }

  get template() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Product categories</h1>
      </div>
      <p>You can change order of subcategories inside according category using drag&drop.</p>
      <div data-element="categories"></div>
    </div>
    `;
  }

  initComponents() {
    const categories = new Categories();
    this.components = { categories };
  }

  async renderComponents() {
    const renderPromises = Object.values(this.components).map(component => component.render());
    await Promise.all(renderPromises);

    Object.keys(this.components).map(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.element = null;
    this.subElements = {};
    this.components = {};
  }
}
