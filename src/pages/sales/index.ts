import menu from '../../components/sidebar/menu';
import { IPage } from '../../types/types';

class SalesPage implements IPage {
  element: Element | null;

  get type() {
    return menu.sales.page;
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<h1>SalesPage</h1>`;
    this.element = wrap.firstElementChild;
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

export default SalesPage;
