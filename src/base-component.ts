import { NodeListOfSubElements, TypeBaseSubElements } from './types/base';

export class BaseComponent {
  element: Element;
  subElements: TypeBaseSubElements;

  get template() {
    return '';
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template || '';
    this.element = wrap.firstElementChild as Element;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element: Element): TypeBaseSubElements {
    const elements: NodeListOfSubElements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => ({ [el.dataset.element]: el, ...acc }), {});
  }

  remove() {
    if (this.element && this.element.remove) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
