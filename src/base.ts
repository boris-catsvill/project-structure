import { NodeListOfSubElements } from './types';

export class Base {
  element: Element;
  subElements: object;
  components: object;

  get template() {
    return '';
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild as Element;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element: Element) {
    const elements: NodeListOfSubElements<typeof this.subElements> =
      element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => ({ ...acc, [el.dataset.element]: el }), {});
  }

  remove() {
    if (this.element && this.element.remove) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    if (this.components) {
      Object.values(this.components).forEach(component => component.destroy());
      console.log('destroy form Base');
    }
  }
}
