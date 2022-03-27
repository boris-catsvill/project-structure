import renderPage from './render-page.js';

// performs routing on all links
export default class Router {
  constructor() {
    this.routes = [];

    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');

      if (href && href.startsWith('/')) {
        event.preventDefault();
        this.navigate(href);
      }
    });
    document.addEventListener('click', this.onSidebarToggle);
  }

  onSidebarToggle = event => {
    const sidebarToggle = event.target.closest('.sidebar__toggler');
    if (sidebarToggle) {
      if (document.body.classList.contains('is-collapsed-sidebar')) {
        document.body.className = '';
      } else {
        document.body.classList.add('is-collapsed-sidebar');
      }
    } else return;
  };

  static instance() {
    if (!this._instance) {
      this._instance = new Router();
    }
    return this._instance;
  }

  async route() {
    let strippedPath = decodeURI(window.location.pathname).replace(/^\/|\/$/, '');

    let match;

    for (let route of this.routes) {
      match = strippedPath.match(route.pattern);

      if (match) {
        this.page = await this.changePage(route.path, match);
        break;
      }
    }

    if (!match) {
      this.page = await this.changePage(this.notFoundPagePath);
    }

    document.dispatchEvent(
      new CustomEvent('route', {
        detail: {
          page: this.page
        }
      })
    );
  }

  async changePage(path, match) {
    if (this.page && this.page.destroy) {
      this.page.destroy();
    }

    return await renderPage(path, match);
  }

  navigate(path) {
    history.pushState(null, null, path);
    this.route();
  }

  addRoute(pattern, path) {
    this.routes.push({ pattern, path });
    return this;
  }

  setNotFoundPagePath(path) {
    this.notFoundPagePath = path;
    return this;
  }

  listen() {
    window.addEventListener('popstate', () => this.route());
    this.route();
  }
}
