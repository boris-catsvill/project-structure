import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';

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


const highlightMenuItem = (event) => {
  const page = event.detail.page.element.dataset.role;
  const sidebarNav = document.querySelector('.sidebar__nav');
  const items = sidebarNav.querySelectorAll('li');
  [...items].forEach(item => {
    const itemPage = item.firstElementChild.dataset.page;
    const action = itemPage === page ? 'add' : 'remove';
    item.classList[action]('active');
  });
};

const toggle = document.querySelector('.sidebar__toggler');

toggle.addEventListener('pointerdown', () => document.body.classList.toggle('is-collapsed-sidebar'));
document.addEventListener('route', highlightMenuItem);





