import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';
import Sidebar from './components/sidebar';

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

document.querySelector('.sidebar').replaceWith(new Sidebar([
  { id: 'dashboard', href: '/', name: 'Панель управления', isActive: true },
  { id: 'products', href: '/products', name: 'Товары', isActive: false },
  { id: 'categories', href: '/categories', name: 'Категории', isActive: false },
  { id: 'sales', href: '/sales', name: 'Продажи', isActive: false },
]).render());

