import { getPageLink, IMenuItem, menu, Pages } from './menu';
import { HTMLDatasetElement, IComponent, IPage, SubElementsType } from '../../types';
import { ROUTER_LINK } from '../../router/router-link';

interface RouteEvent extends CustomEvent<Record<'page', IPage>> {}

class Sidebar implements IComponent {
  static instance: Sidebar | null;
  element: Element | null;
  subElements: SubElementsType;
  title: string;

  constructor({ title = '' } = {}) {
    if (Sidebar.instance) {
      return Sidebar.instance;
    }
    Sidebar.instance = this;
    this.title = title;
    this.render();
  }

  get template() {
    return `<aside class='sidebar'>
              <h2 class='sidebar__title'>
                  <a is='${ROUTER_LINK}' href='${getPageLink('dashboard')}'>${this.title}</a>
              </h2>
              <ul class='sidebar__nav' data-element='menu'>
                  ${this.getMenu()}
              </ul>
              <ul class='sidebar__nav sidebar__nav_bottom'>
                <li>
                    <button class='sidebar__toggler' type='button' data-element='toggler'>
                        <i class='icon-toggle-sidebar'></i> <span>Toggle sidebar</span>
                    </button>
                </li>
               </ul>
              </aside>`;
  }

  onRoute = ({ detail }: RouteEvent) => {
    const pageType: Pages = detail.page.type;
    this.setActiveMenuItem(pageType);
  };

  setActiveMenuItem(page: Pages) {
    const { menu } = this.subElements;
    const activeItems: NodeListOf<Element> = menu.querySelectorAll('.active');
    [...activeItems].forEach(item => {
      item.classList.remove('active');
    });
    const item = menu.querySelector(`[data-page=${page}]`)?.closest('li');
    if (item) item.classList.add('active');
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild;
    this.subElements = this.getSubElements(this.element!);
    this.initListener();
  }

  getSubElements(element: Element) {
    const elements: NodeListOf<HTMLDatasetElement> = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc: SubElementsType, el) => {
      acc[el.dataset.element] = el;
      return acc;
    }, {});
  }

  initListener() {
    this.subElements.toggler.addEventListener('pointerdown', e => this.toggle(e));
    document.addEventListener('route', this.onRoute as EventListener);
  }

  toggle(e: PointerEvent) {
    e.preventDefault();
    document.body.classList.toggle('is-collapsed-sidebar');
  }

  getMenu() {
    return Object.values(menu)
      .map(item => this.getMenuItem(item))
      .join('');
  }

  getMenuItem({ page, title, url }: IMenuItem) {
    return `<li>
              <a is='${ROUTER_LINK}' data-page='${page}' href='${url}'>
                <i class='icon-${page}'></i> <span>${title}</span>
              </a>
            </li>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('route', this.onRoute as EventListener);
    Sidebar.instance = null;
  }
}

const title: string = 'shop admin';

const sidebar = new Sidebar({ title });

export default sidebar;
