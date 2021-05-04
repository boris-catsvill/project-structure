import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';

tooltip.initialize();

document.querySelector('.sidebar__toggler').addEventListener('pointerdown', (event)=>{
  if(document.body.contains('is-collapsed-sidebar')){
    document.body.remove('is-collapsed-sidebar')
  } else{
    document.body.add("is-collapsed-sidebar");
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
