import Router from './router/index.js';
import Tooltip from './components/tooltip/index.js';
import SidePanel from './components/side-panel/index.js';

const tooltip = new Tooltip();
tooltip.initialize();

const sidePanel = new SidePanel();
sidePanel.initialize();

const router = Router.instance();

router
  .addRoute(/^$/, 'dashboard')
  .addRoute(/^products$/, 'products/list')
  .addRoute(/^products\/add$/, 'products/edit')
  .addRoute(/^products\/([\w()-]+)$/, 'products/edit')
  .addRoute(/^products\(('[\w-]+')+\)$/, 'products/edit')
  .addRoute(/^sales$/, 'sales')
  .addRoute(/^categories$/, 'categories')
  .addRoute(/^404\/?$/, 'error404')
  .setNotFoundPagePath('error404')
  .listen();
