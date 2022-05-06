export default class PageBase {
  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      result[element.dataset.element] = element;
    }
    return result;
  }
  renderComponents() {
    for (const [name, component] of Object.entries(this.components)) {
      this.subElements[name].append(component.element);
    }
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }
  destroy() {
    if (this.components) {
      for (const component of Object.values(this.components)) {
        component.destroy();
      }
    }
    this.components = null;
    this.remove();
  }
}