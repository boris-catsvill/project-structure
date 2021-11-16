import nav from '@/components/sidebar/nav.js';

export default class Sidebar {
  element;
  subElements = {};
  nav = nav;

  onToggle = event => {
    event.preventDefault();

    document.body.classList.toggle('is-collapsed-sidebar');
  }

  constructor({ title = '' } = {}) {
    this.title = title;

    this.render();
    this.initEventListeners();
  }

  get template() {
    return `
      <aside class="sidebar">
        <h2 class="sidebar__title">
          <a href="/">${this.title}</a>
        </h2>
        <ul class="sidebar__nav">${this.createNav()}</ul>
        <ul class="sidebar__nav sidebar__nav_bottom">
          <li>
            <button data-element="toggler" class="sidebar__toggler" type="button">
              <i class="icon-toggle-sidebar"></i> <span>Toggle sidebar</span>
            </button>
          </li>
        </ul>
      </aside>
    `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);
  }

  createNav() {
    return this.nav
      .map(({ url, icon, title }) => {
        return `
          <li>
            <a href="${url}">
              <i class="${icon}"></i> <span>${title}</span>
            </a>
          </li>
        `;
      })
      .join('');
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.subElements.toggler.addEventListener('pointerdown', this.onToggle);
  }

  initialize() {
    const sidebarNode = document.querySelector('#sidebar');

    if (sidebarNode) {
      sidebarNode.innerHTML = '';
      sidebarNode.append(this.element);
    }
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.nav = [];
  }
}
