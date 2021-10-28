export default class Sidebar {
  menu = [
    {
      title: 'Dashboard',
      icon: 'icon-dashboard',
      href: '/',
      id: 'dashboard'
    },
    {
      title: 'Products',
      icon: 'icon-products',
      href: '/products',
      id: 'categories'
    },
    {
      title: 'Categories',
      icon: 'icon-categories',
      href: '/categories',
      id: 'categories'
    },
    {
      title: 'Sales',
      icon: 'icon-sales',
      href: '/sales',
      id: 'sales'
    }
  ];

  onToggleSidebar = () => {
      document.body.classList.toggle('is-collapsed-sidebar');
  }

  constructor() {
      this.render();
  }

  render() {
      const menu = this.menu.map(item => this.getTemplateMenuItem(item));
      this.element = this.toHTML(this.getTemplate(menu.join('')));
      this.subElements = this.getSubElements(this.element);
      this.addEventListeners();
  }

  getTemplate(menu) {
    return `
        <aside class="sidebar">
            <h2 class="sidebar__title">
                <a href="/">shop admin</a>
            </h2>
            <ul class="sidebar__nav" data-element="menu">
                ${menu}
            </ul>
            <ul class="sidebar__nav sidebar__nav_bottom">
                <li>
                    <button type="button" data-element="toggleBtn" class="sidebar__toggler">
                    <i class="icon-toggle-sidebar"></i> <span>Toggle sidebar</span>
                    </button>
                </li>
            </ul>
        </aside>
        `;
  }

  getTemplateMenuItem(item) {
      return `
        <li><a href="${item.href}" data-page="${item.id}"><i class="${item.icon}"></i> <span>${item.title}</span></a></li>
      `;
  }

  addEventListeners() {
    this.subElements.toggleBtn.addEventListener('click', this.onToggleSidebar);
  }

  removeEventListeners() {
    this.subElements.toggleBtn.removeEventListener('click', this.onToggleSidebar);
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach(el => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  remove() {
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}
