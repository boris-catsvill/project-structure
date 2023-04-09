export default class PageComponent {
  element;
  subElements = {};
  components = {};
  backendUrl = process.env.BACKEND_URL;

  get template() {
  }

  constructor(match) {
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    await this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements() {
    const subElements = {};

    for (const elem of this.element.querySelectorAll('[data-element]')) {
      subElements[elem.dataset.element] = elem;
    }

    return subElements;
  }

  async initComponents() {

  }

  initEventListeners() {

  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}