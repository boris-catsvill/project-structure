import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';
import toggleSidebar from "./utils/toggleSidebar.js";

tooltip.initialize();

const sidebarToggler = document.body.querySelector('.sidebar__toggler');
sidebarToggler.addEventListener('pointerdown', toggleSidebar);

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
