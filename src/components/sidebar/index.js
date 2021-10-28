class Sidebar {
  static sidebarInstance = null;

  onPageRender = event => {
    const pagePath = event.detail.path;

    this.setActiveItem(pagePath);
  };

  constructor() {
    if (!Sidebar.sidebarInstance) {
      Sidebar.sidebarInstance = this;
    }

    return Sidebar.sidebarInstance;
  }

  initialize() {
    this.render();
    this.initToggleButton();
    this.addEventListeners();
  }

  render() {
    this.element = document.querySelector(`[data-element=sidebar-nav]`);
    this.element.innerHTML = this.template;
    this.subElements = this.getSubElements(this.element);
  }

  get template() {
    return `
      <h2 class="sidebar__title">
        <a href="/">shop admin</a>
      </h2>
      <ul class="sidebar__nav">
        <li>
          <a href="/" data-page="dashboard">
            <i class="icon-dashboard"></i> <span>Dashboard</span>
          </a>
        </li>
        <li>
          <a href="/products" data-page="products">
            <i class="icon-products"></i> <span>Products</span>
          </a>
        </li>
        <li>
          <a href="/categories" data-page="categories">
            <i class="icon-categories"></i> <span>Categories</span>
          </a>
        </li>
        <li>
          <a href="/sales" data-page="sales">
            <i class="icon-sales"></i> <span>Sales</span>
          </a>
        </li>
      </ul>
      <ul class="sidebar__nav sidebar__nav_bottom">
        <li>
          <button type="button" class="sidebar__toggler" data-element="toggleButton">
            <i class="icon-toggle-sidebar"></i> <span>Toggle sidebar</span>
          </button>
        </li>
      </ul>
    `;
  }

  initToggleButton() {
    this.subElements.toggleButton.addEventListener('pointerdown', () => {
      document.body.classList.toggle('is-collapsed-sidebar');
    });
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

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');

    return Array.from(subElements).reduce((result, el) => {
      result[el.dataset.element] = el;

      return result;
    }, {});
  }
}

const sidebar = new Sidebar();

export default sidebar;
