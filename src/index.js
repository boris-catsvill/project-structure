import Router from './router/index.js';
import Tooltip from './components/tooltip/index.js';
import Sidebar from './components/sidebar/index.js';

const tooltip = new Tooltip();
tooltip.initialize();

const router = Router.instance();

const sidebar = new Sidebar();

document.querySelector('[data-sidebar]').replaceWith(sidebar.element);

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
