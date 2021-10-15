import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';

const URL_PATH = process.env.URL_PATH;

console.error('URL_PATH', URL_PATH);

class MainPage {
  constructor () {
    tooltip.initialize();

    this.router = Router.instance();
    this.render();

    this.addEventListeners();
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    document.body.append(this.element);
  }

  get template() {
    return `
      <main class="main">
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
                <i class="icon-dashboard"></i> <span>Панель управления</span>
              </a>
            </li>
            <li>
              <a href="/products" data-page="products">
                <i class="icon-products"></i> <span>Товары</span>
              </a>
            </li>
            <li>
              <a href="/categories" data-page="categories">
                <i class="icon-categories"></i> <span>Категории</span>
              </a>
            </li>
            <li>
              <a href="/sales" data-page="sales">
                <i class="icon-sales"></i> <span>Продажи</span>
              </a>
            </li>
          </ul>
          <ul class="sidebar__nav sidebar__nav_bottom">
            <li>
              <button type="button" class="sidebar__toggler">
                <i class="icon-toggle-sidebar"></i> <span>Скрыть панель</span>
              </button>
            </li>
          </ul>
        </aside>
        <section class="content" id="content">

        </section>
      </main>
    `;
  }

  initializeRouter() {
    this.router
      .addRoute(new RegExp(`^${URL_PATH}$`), 'dashboard')
      .addRoute(new RegExp(`^${URL_PATH}products$`), 'products/list')
      .addRoute(new RegExp(`^${URL_PATH}products/add$`), 'products/edit')
      .addRoute(new RegExp(`^${URL_PATH}products/([\\w()-]+)$`), 'products/edit')
      .addRoute(new RegExp(`^${URL_PATH}sales$`), 'sales')
      .addRoute(new RegExp(`^${URL_PATH}categories$`), 'categories')
      .addRoute(/404\/?$/, 'error404')
      .setNotFoundPagePath('error404')
      .listen();
  }

  addEventListeners() {
    this.element.querySelector('.sidebar__toggler').addEventListener('click', event => {
      event.preventDefault();
      document.body.classList.toggle('is-collapsed-sidebar');
    });
  }
}

const mainPage = new MainPage();

document.body.append(mainPage.element);

mainPage.initializeRouter();
