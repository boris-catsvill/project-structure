import Router from './router/index.js';
import Tooltip from './components/tooltip/index.js';

Tooltip.instance.initialize();

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

document.addEventListener('DOMContentLoaded', () => {
  const sidebarHidden = JSON.parse(localStorage.getItem('sidebar_hidden')) ?? false;
  if (sidebarHidden) {
    document.body.classList.add('is-collapsed-sidebar');
  }

  document.querySelector('.sidebar__toggler').addEventListener('click', event => {
    event.preventDefault();
    const isHidden = document.body.classList.toggle('is-collapsed-sidebar');

    localStorage.setItem('sidebar_hidden', JSON.stringify(isHidden));
  });

}, { once: true });
