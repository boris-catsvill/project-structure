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
}