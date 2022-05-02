import Router from './router/index.js';
import tooltip from "./components/tooltip/index.js";
import NotificationMessage from "./components/notification";

class MainPage {
  constructor() {
    tooltip.initialize();

    this.router = Router.instance();
  }

  getTemplate() {
    return `<main class="main">
              <div class="progress-bar">
                <div class="progress-bar__line"></div>
              </div>
              <aside class="sidebar">
                <h2 class="sidebar__title">
                  <a href="/">shop admin</a>
                </h2>
                <ul class="sidebar__nav">
                  <li>
                    <a href="/" data-page="dashboard">
                      <i class="icon-dashboard"></i> <span>Dashboard</span>
                    </a>
                  </li>
                  <li>
                    <a href="/products" data-page="products">
                      <i class="icon-products"></i> <span>Products</span>
                    </a>
                  </li>
                  <li>
                    <a href="/categories" data-page="categories">
                      <i class="icon-categories"></i> <span>Categories</span>
                    </a>
                  </li>
                  <li>
                    <a href="/sales" data-page="sales">
                      <i class="icon-sales"></i> <span>Sales</span>
                    </a>
                  </li>
                </ul>
                <ul class="sidebar__nav sidebar__nav_bottom">
                  <li>
                    <button type="button" class="sidebar__toggler">
                      <i class="icon-toggle-sidebar"></i> <span>Toggle sidebar</span>
                    </button>
                  </li>
                </ul>
              </aside>
              <section class="content" id="content"></section>
            </main>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    return this.element;
  }

  initRoutes() {
    this.router
      .addRoute(/^$/, 'dashboard')
      .addRoute(/^products$/, 'products/list')
      .addRoute(/^products\/add$/, 'products/edit')
      .addRoute(/^products\/([\w()-]+)$/, 'products/edit')
      .addRoute(/^sales$/, 'sales')
      .addRoute(/^categories$/, 'categories')
      .addRoute(/^404\/?$/, 'error404')
      .setNotFoundPagePath('error404')
      .listen();
  }

  addEventListeners() {
    const sideBarToggler = document.querySelector(`.sidebar__toggler`);
    sideBarToggler.onclick = () => document.body.classList.toggle('is-collapsed-sidebar');

    const mainSection = document.getElementById('content');

    mainSection.addEventListener('network-error', (event) => {
      const notification = new NotificationMessage(event.detail, {
        duration: 2000,
        type: 'notification_error',
      });

      notification.show(mainSection);
    });
  }
}


const page = new MainPage();
const element = page.render();

document.body.append(element);
page.initRoutes();
page.addEventListeners();


