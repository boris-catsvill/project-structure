class Sidebar {
  static sidebarInstance = null;

  onPageRender = event => {
    const pagePath = event.detail.path;

    this.setActiveItem(pagePath);
  }

  constructor() {
    if (!Sidebar.sidebarInstance) {
      Sidebar.sidebarInstance = this;
    } else {
      return Sidebar.sidebarInstance;
    }

    this.element = document.querySelector(`[data-element=sidebar-nav]`);
  }

  initialize() {
    this.initToggleButton();
    this.addEventListeners();
  }

  initToggleButton() {
    const toggleButton = this.element.querySelector('.sidebar__toggler');

    if (toggleButton !== null) {
      toggleButton.addEventListener('pointerdown', () => {
        document.body.classList.toggle('is-collapsed-sidebar');
      });
    }
  }

  setActiveItem(pagePath) {
    const page = pagePath.replace(/^\/|\/$/, '').split('/').shift();
    const activeLink = this.element.querySelector(`[data-page=${page}]`);
    const menuItems = this.element.querySelectorAll('li');

    [...menuItems].forEach(item => {
      item.classList.remove('active');
      item.firstElementChild.blur();
    });

    if (activeLink) {
      activeLink.parentElement.classList.add('active');
    }
  }

  addEventListeners() {
    document.addEventListener("route", this.onPageRender);
  }
}

const sidebar = new Sidebar();

export default sidebar;
