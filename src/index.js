import Router from '@/router/index.js';
import Tooltip from '@/components/tooltip/index.js';
import Sidebar from '@/components/sidebar/index.js';

const tooltip = new Tooltip();
const sidebar = new Sidebar({ title: 'shop admin' });
const router = Router.instance();

tooltip.initialize();
sidebar.initialize();

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
