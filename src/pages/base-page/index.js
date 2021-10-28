export default class BasePage {
  element;
  subElements = {};
  components = {};

  constructor(path) {

  }

  async render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.components = await this.getComponents();

    Object.keys(this.components).forEach(key => {
      this.subElements[key].append(this.components[key].element);
    });

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {

  }

  get template() {
    return `<div></div>`;
  }

  getSubElements(parent) {
    const result = {};

    for (const subElement of parent.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  async getComponents() {
    return {};
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    Object.values(this.components).forEach(component => component.destroy());
    this.components = {};
  }
}
