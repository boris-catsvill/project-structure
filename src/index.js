import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';

import { checkHighlightLi, toggleSideBar, showNotification } from './utils/heplerFunctions.js';
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


const btnSidebarToggler = document.querySelector('.sidebar__toggler');
btnSidebarToggler.addEventListener('click', toggleSideBar);
checkHighlightLi();

document.addEventListener('sortable-list-reorder', showNotification);

