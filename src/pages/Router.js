export default class Router {
    static instance = null;

    constructor() {
        if (!Router.instance) Router.instance = this;

        this.routes = [];
        this.activePage = null;
        this.undefinedPage = null;

        return Router.instance;
    }

    addRoute(pattern, page) {
        this.routes.push({ pattern, page })
        return this;
    }

    setUndefinedPage(page) {
        this.undefinedPage = page;
        return this;
    }

    setActivePageHandler = () => {
        this.activePage?.destroy();

        const path = document.location.pathname;

        const activeRoute = this.routes.find(({ pattern }) => path.match(pattern));

        const activePage = new (activeRoute?.page ?? UndefinedPage)()
        this.activePage = activePage;
        
        document.documentElement.dispatchEvent(new CustomEvent('page-selected', {
            bubbles: true,
        }));
        console.log(this.activePage)
    }

    pathSelectedHandler = (event) => {

        const closestLink = event.target.closest('a');

        const path = closestLink?.getAttribute('href') ?? '';

        if (!closestLink) { return; }
        if (!path.startsWith('/')) { return; }

        event.preventDefault();

        window.history.pushState(null, null, path);

        event.target.dispatchEvent(new CustomEvent('path-selected', {
            bubbles: true,
        }));
    }

    listen() {
        window.addEventListener('click', this.pathSelectedHandler);
        window.addEventListener('popstate', this.setActivePageHandler);
        window.addEventListener('path-selected', this.setActivePageHandler);

        this.setActivePageHandler();
    }

    destroy() {
        Router.instance = null;
        this.activePage = null;
    }
}