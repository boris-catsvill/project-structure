import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';
import sidebar from './components/sidebar/index.js';

tooltip.initialize();
sidebar.initialize();

document.addEventListener('route', () => {
  if (tooltip.element !== null) {
    tooltip.element.remove();
  }
});

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
