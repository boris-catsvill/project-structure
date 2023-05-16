import { IPage } from '../../../types/types';
import menu from '../../../components/sidebar/menu';

export default class Page implements IPage {
  element: Element | null;
  subElements = {};
  components = {};

  get type() {
    return menu.products.page;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div>
        <h1>Edit page</h1>
      </div>`;

    this.element = element.firstElementChild;

    return this.element;
  }

  remove() {
    if (this.element) {
      this.element = null;
    }
  }

  destroy() {
    this.remove();
  }
}
