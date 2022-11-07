import Router from './router/index.js';
import tooltip from './components/tooltip/index';

const router = Router.instance();
const tooltipComponent = new tooltip();
const sidebarToggler = document.querySelector('.sidebar__toggler');

tooltipComponent.initialize();

sidebarToggler.addEventListener('click', () =>
  document.body.classList.toggle('is-collapsed-sidebar')
);

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
