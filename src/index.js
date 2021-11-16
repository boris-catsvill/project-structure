import Router from '@/router/index.js';
import Tooltip from '@/components/tooltip/index.js';

const tooltip = new Tooltip();
const router = Router.instance();

tooltip.initialize();

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

const sidebarToggle = document.querySelector('.sidebar__toggler');
const onSidebarToggleClick = event => {
  event.preventDefault();

  document.body.classList.toggle('is-collapsed-sidebar');
};

if (sidebarToggle) {
  sidebarToggle.addEventListener('pointerdown', onSidebarToggleClick);
}
