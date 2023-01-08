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

document.querySelector(".sidebar__toggler").addEventListener("click", event =>{
  event.preventDefault();
  document.body.classList.toggle("is-collapsed-sidebar");
});
document.addEventListener("route", event => {
  let menuItem = document.querySelector(".sidebar__nav li.active");
  if (menuItem) {
    menuItem.classList.remove('active');
  }

  for (let li of document.querySelectorAll(".sidebar__nav a[data-page]")) {
    if (event.detail.page && li.dataset.page === event.detail.page.section) {
      li.closest("li").classList.add("active");
    }
  }
});
