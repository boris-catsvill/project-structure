import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';
import { sidebar } from './components/sidebar';

const content = document.getElementById('content') as HTMLElement;
const { element } = sidebar;
content.insertAdjacentElement('beforebegin', element);

tooltip.initialize();

const router = Router.instance();

router
  .addRoute(/^$/, 'dashboard')
  .addRoute(/^products$/, 'products/list')
  .addRoute(/^products\/add$/, 'products/edit')
  .addRoute(/^products\/(?<productId>[\w()-]+)$/, 'products/edit')
  .addRoute(/^sales$/, 'sales')
  .addRoute(/^categories$/, 'categories')
  .addRoute(/^404\/?$/, 'error404')
  .setNotFoundPagePath('error404')
  .listen();
