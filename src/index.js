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

document.querySelector('button.sidebar__toggler').addEventListener('click', () => {
  document.body.classList.toggle('is-collapsed-sidebar');
});

const nav = [...document.querySelectorAll('.sidebar__nav a[data-page]')].map(item => ({
  page: item.dataset.page,
  element: item.parentElement,
}));

document.addEventListener('route', event => {
  const path = `${event.detail.path}/`;

  nav.forEach(item => {
    path.startsWith(`${item.page}/`)
      ? item.element.classList.add('active')
      : item.element.classList.remove('active');
  });
})