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

const toggleSidebar = document.querySelector('.sidebar__toggler');

toggleSidebar.addEventListener('click', () => {
  document.body.classList.toggle('is-collapsed-sidebar');
});

document.addEventListener('route', event => {
  const pageName = event.detail.page.element.className;
  const pages = document.querySelectorAll('[data-page]');

  for (const page of pages) {
    if (pageName.includes(page.dataset.page)) {
      page.parentElement.classList.add('active');
    } else {
      page.parentElement.classList.remove('active');
    }
  }
});
