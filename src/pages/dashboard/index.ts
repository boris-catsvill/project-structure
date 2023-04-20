import { IPage } from '../../types/types';
import menu from '../../components/sidebar/menu';

class Dashboard implements IPage {
  element: Element | null;

  get type() {
    return menu.dashboard.page;
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<h1>Dashboard</h1>`;
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

export default Dashboard;
