import menuObject, { IMenuItem } from './menu';
import { HTMLDatasetElement, IComponent, IPage, SubElementsType } from '../../types';

type MenuType = Array<IMenuItem>;

interface RouteEvent extends CustomEvent<Record<'page', IPage>> {}

type SidebarArgs = {
  title?: string;
  menu?: MenuType;
};

class Sidebar implements IComponent {
  static instance: Sidebar | null;
  element: Element | null;
  menu: MenuType;
  subElements: SubElementsType;
  title: string;

  constructor({ title = '', menu = [] }: SidebarArgs = {}) {
    if (Sidebar.instance) {
      return Sidebar.instance;
    }
    Sidebar.instance = this;
    this.menu = menu;
    this.title = title;
    this.render();
  }

  get template() {
    return `<aside class='sidebar'>
              <h2 class='sidebar__title'>
                  <a href='/'>${this.title}</a>
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

  onRoute = (evt: Event) => {
    const { detail } = evt as RouteEvent;
    const pageType = detail.page.type;
    this.setActiveMenuItem(pageType);
  };

  setActiveMenuItem(page: string) {
    const activeItems: Element[] = Array.from(this.subElements.menu.querySelectorAll('.active'));
    [...activeItems].forEach(item => {
      item.classList.remove('active');
    });
    const item = this.subElements.menu.querySelector(`[data-page=${page}]`)?.closest('li');
    if (item) {
      item.classList.add('active');
    }
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
    document.addEventListener('route', this.onRoute);
  }

  toggle(e: PointerEvent) {
    e.preventDefault();
    document.body.classList.toggle('is-collapsed-sidebar');
  }

  getMenu() {
    return this.menu.map(item => this.getMenuItem(item)).join('');
  }

  getMenuItem({ page, title, href }: IMenuItem) {
    return `<li>
              <a data-page='${page}' href='${href}'>
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
    document.removeEventListener('route', this.onRoute);
    Sidebar.instance = null;
  }
}

const title: string = 'shop admin';
const menu: MenuType = Object.values(menuObject);
const sidebar = new Sidebar({ title, menu });

export default sidebar;
