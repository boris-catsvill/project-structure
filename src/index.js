import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';

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

const onSidebarToggle = () => {
  const documentBodyClassList = document.body.classList;
  const collapsedSidebarClass = 'is-collapsed-sidebar';

  if (documentBodyClassList.contains(collapsedSidebarClass)) {
    documentBodyClassList.remove(collapsedSidebarClass);
  } else {
    documentBodyClassList.add(collapsedSidebarClass);
  }
};

document.querySelector('.sidebar__toggler').addEventListener('pointerdown', onSidebarToggle);
