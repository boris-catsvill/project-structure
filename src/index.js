import Router from './router/index.js';
import SidePanel from './components/side-panel/index.js';

const URL_PATH = process.env.URL_PATH;

const panel = new SidePanel('shop admin', [
  {
    path: `${URL_PATH}`,
    id: 'dashboard',
    text: 'Dashboard'
  },
  {
    path: `${URL_PATH}products`,
    id: 'products',
    text: 'Products'
  },
  {
    path: `${URL_PATH}categories`,
    id: 'categories',
    text: 'Categories'
  },
  {
    path: `${URL_PATH}sales`,
    id: 'sales',
    text: 'Sales'
  }
]);
document.querySelector('#main').append(panel.element);

const router = Router.instance();
router
  .addRoute(new RegExp(`^${URL_PATH}$`), 'dashboard')
  .addRoute(new RegExp(`^${URL_PATH}products$`), 'products/list')
  .addRoute(new RegExp(`^${URL_PATH}products/add$`), 'products/edit')
  .addRoute(new RegExp(`^${URL_PATH}products/([\\w()-]+)$`), 'products/edit')
  .addRoute(new RegExp(`^${URL_PATH}sales$`), 'sales')
  .addRoute(new RegExp(`^${URL_PATH}categories$`), 'categories')
  .addRoute(new RegExp(`^${URL_PATH}404/?$`), 'error404')
  .setNotFoundPagePath('error404')
  .listen();
