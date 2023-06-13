import { getPageLink, Menu } from './menu';
import { ROUTER_LINK } from '../../router/router-link';
import { BaseComponent } from '../../base-component';
import { IPage } from '../../types/base';
import { IMenuItem, Pages } from '../../types';
import { CUSTOM_EVENTS } from '../../constants';

interface RouteEvent extends CustomEvent<Record<'page', IPage>> {}

class Sidebar extends BaseComponent {
  static instance: Sidebar | null;

  title: string;

  constructor(title = '') {
    super();
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
    super.render();
    this.initListener();
  }

  initListener() {
    this.subElements.toggler.addEventListener('pointerdown', e => this.toggle(e));
    document.addEventListener(CUSTOM_EVENTS.Route, this.onRoute as EventListener);
  }

  toggle(e: PointerEvent) {
    e.preventDefault();
    document.body.classList.toggle('is-collapsed-sidebar');
  }

  getMenu() {
    return Object.values(Menu)
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

  destroy() {
    super.destroy();
    document.removeEventListener(CUSTOM_EVENTS.Route, this.onRoute as EventListener);
    Sidebar.instance = null;
  }
}

export const sidebar = new Sidebar('shop admin');
