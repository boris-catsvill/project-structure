export default class Router {
    static instance = null;

    constructor() {
        if (Router.instance) { return Router.instance; }
        
        this.routes = [];
        this.activePage = null;
        this.undefinedPage = null;

        Router.instance = this;
        return this;
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

        this.activePage = new (activeRoute?.page ?? this.undefinedPage)()
        
        document.documentElement.dispatchEvent(new CustomEvent('page-selected', {
            bubbles: true,
        }));
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
        this.undefinedPage = null
    }
}