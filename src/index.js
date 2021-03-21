import Router from './router';
import tooltip from './components/tooltip';

const URL_PATH = process.env.URL_PATH;

class MainPage {
  navList = [];

  onRoute = event => {
    const path = `${event.detail.path}/`;
  
    this.navList.forEach(item => {
      if (path.startsWith(`${item.page}/`)) {
        item.element.classList.add('active');
      } else {
        item.element.classList.remove('active');
      }
    });
  };

  constructor () {
    tooltip.initialize();
    this.router = Router.instance();

    this.render();
    this.addEventListeners();
  }

  get template () {
    return `
      <main class="main">
      <div class="progress-bar">
        <div class="progress-bar__line"></div>
      </div>
      <aside class="sidebar">
        <h2 class="sidebar__title">
          <a href="/${URL_PATH}">shop admin</a>
        </h2>
        <ul class="sidebar__nav">
          <li>
            <a href="/${URL_PATH}" data-page="dashboard">
              <i class="icon-dashboard"></i> <span>Панель управления</span>
            </a>
          </li>
          <li>
            <a href="/${URL_PATH}products" data-page="products">
              <i class="icon-products"></i> <span>Товары</span>
            </a>
          </li>
          <li>
            <a href="/${URL_PATH}categories" data-page="categories">
              <i class="icon-categories"></i> <span>Категории</span>
            </a>
          </li>
          <li>
            <a href="/${URL_PATH}sales" data-page="sales">
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

  render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.navList = [...this.element.querySelectorAll('.sidebar__nav a[data-page]')].map(item => ({
      page: item.dataset.page,
      element: item.parentElement,
    }));

    document.body.append(this.element);
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
    const sidebarToggle = this.element.querySelector('.sidebar__toggler');

    sidebarToggle.addEventListener('click', event => {
      event.preventDefault();
      document.body.classList.toggle('is-collapsed-sidebar');
    });
    
    document.addEventListener('route', this.onRoute);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;

    document.removeEventListener('route', this.onRoute);
  }
}

const mainPage = new MainPage();
mainPage.initializeRouter();
