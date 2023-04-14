import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';

tooltip.initialize();

const button = document.querySelector('.sidebar__toggler');
button.addEventListener('click', () => {
  document.body.classList.toggle('is-collapsed-sidebar');
});

const sidebarList = document.querySelector('.sidebar__nav').children;
let selectedItem;

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
  .addRouteHandler(route => {
    for (let item of sidebarList) {
      const page = item.firstElementChild.dataset.page;
      const [match] = route.path.match(/^^[^/]*/);
      if (match == page) {
        if (selectedItem) selectedItem.classList.remove('active');
        item.classList.add('active');
        selectedItem = item;
        break;
      }
    }
  })
  .listen();
