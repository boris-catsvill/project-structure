import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';
import sidebarEventsInit from './utils/sidebar.js';

tooltip.initialize();
sidebarEventsInit();

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

document.querySelector(".sidebar__toggler").addEventListener("click", event => {
  event.preventDefault();
  document.body.classList.toggle("is-collapsed-sidebar");
});
