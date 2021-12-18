import Router from './router/index.js';
import Tooltip from './components/tooltip/index.js';
import SortableTable from './components/sortable-table/index.js';

const tooltip = new Tooltip();
tooltip.initialize();

const router = Router.instance();

router
  .addRoute(/^$/, 'dashboard')
  .addRoute(/^products$/, 'products/list')
  .addRoute(/^products\/add$/, 'products/edit')
  .addRoute(/^products\/([\w()-]+)$/, 'products/edit')
  .addRoute(/^sales$/, 'sales')
  .addRoute(/^categories$/, 'categories')
  .addRoute(/^404\/?$/, 'error404')
  .setNotFoundPagePath('error404')
  .listen();

const menuToggleHandler = (event) => {
  const target = event.target.closest('label');
  if (!target) return;
  if (target.classList.contains('sidebar__toggler_visible')) {
    const checkbox = document.body.querySelector('#visible');
    checkbox.checked = !checkbox.checked;
    document.body.classList.toggle('is-collapsed-sidebar');
  }
  if (target.classList.contains('sidebar__toggler_sorting-type')) {
    const checkbox = document.body.querySelector('#sorting');
    checkbox.checked = !checkbox.checked;
    SortableTable.isSortLocally = !SortableTable.isSortLocally;
  }
};

const highlightNavItem = (event) => {
  const pageClassList = event.detail.page.element.classList;
  const sidebar = document.querySelector('.sidebar__nav');
  const navItems = sidebar.querySelectorAll('li');
  [...navItems].forEach(li => {
    const dataPage = li.firstElementChild.dataset.page;
    const toggle = pageClassList.contains(dataPage) ? 'add' : 'remove';
    li.classList[toggle]('active');
  });
};

document.querySelector('.sidebar__nav_bottom')
  .addEventListener('pointerdown', menuToggleHandler);

document.addEventListener('route', highlightNavItem);
