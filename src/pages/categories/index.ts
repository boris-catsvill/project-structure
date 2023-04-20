import { IPage, PageType } from '../../types/types';
import menu from '../../components/sidebar/menu';

class Categories implements IPage {
  element: Element | null;

  get type(): PageType {
    return menu.categories.page;
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<h1>Categories</h1>`;
    this.element = wrap.firstElementChild as Element;
    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

export default Categories;
