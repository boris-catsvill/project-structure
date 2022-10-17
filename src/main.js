import DashboardPage from "./pages/DashBoardPage.js";
import SalesPage from './pages/SalesPage.js';
import CategoriesPage from './pages/CategoriesPage.js';
import ProductsPage from './pages/ProductsPage.js';
import ProductFormPage from './pages/ProductFormPage.js';
import UndefinedPage from './pages/UndefinedPage.js';

import NotificationMessage from "./components/Notification.js";
import Sidebar from "./components/Sidebar.js";
import Tooltip from './components/Tooltip.js';

import errorHandler from "./store/errorHandler.js";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
	static currentAdminPage

	range = {}
	subElements = {}
	contentContainer = null
	showingPage = null
	currentPathnameOfPage = window.location.pathname;

	sidebarWrapper = new Sidebar()

	constructor() {
	  if (Page.currentAdminPage) { return Page.currentAdminPage; }
	  Page.currentAdminPage = this;

	  this.range = this.createRange();

	  this.pages = {
	    '/': DashboardPage,
	    '/products': ProductsPage,
	    '/categories': CategoriesPage,
	    '/sales': SalesPage
	  };
	  this.urlsOfAJAX = {
	    '/': 'api/dashboard/',
	    '/products': 'api/rest/products',
	    '/categories': ['/api/rest/categories', 'api/rest/subcategories'],
	    '/sales': 'api/rest/orders',
	  };

	  this.render();
	}

	createRange() {
	  const firstDate = new Date();
	  const secondDate = new Date();

	  const monthOfSecondDate = secondDate.getMonth();
	  firstDate.setMonth(monthOfSecondDate - 1);

	  return { from: firstDate, to: secondDate };
	}

	toggleProgressbar() {
	  const { progressBar } = this.subElements;
	  progressBar.hidden = !progressBar.hidden;
	}

	toggleSidebarHandler = () => {
	  document.body.classList.toggle('is-collapsed-sidebar');
	}

	get mainElement() {
	  const wrapper = document.createElement('div');
	  const bodyOfWrapper = `
			<main class="main">
				<div class="progress-bar" data-element="progressBar" hidden>
					<div class="progress-bar__line"></div>
				</div>
				<section class="content" id="content"></section>
			</main>`;
	  wrapper.innerHTML = bodyOfWrapper;

	  const mainElement = wrapper.firstElementChild;
	  mainElement
	  	.querySelector('[data-element="progressBar"]')
		.insertAdjacentElement('afterend', this.sidebarWrapper.element);

	  return mainElement;
	}


	getDataOfProductFormPage() {
	  const [id] = this.currentPathnameOfPage.match(/([a-z0-9_-]+$)/i) ?? [];
	  return {
	    mainClass: this,
	    productId: id === 'add' ? null : id,
	    urls: { ...this.urlsOfAJAX, backendURL: BACKEND_URL }
	  };
	}

	getDataOfPlainPage() {
	  const { from, to } = this.range;
	  return {
	    mainClass: this,
	    range: {
	      from: from.toString(),
	      to: to.toString()
	    },
	    url: [this.urlsOfAJAX[this.currentPathnameOfPage], BACKEND_URL],
	  };
	}

	updateShowingPage() {
	  try {
		this.showingPage?.destroy();
		this.toggleProgressbar();

		const [isFormPage] = this.currentPathnameOfPage.match(/\/products\/([a-z0-9_-]+)/i) ?? [];

		const inputData = isFormPage
		  ? this.getDataOfProductFormPage()
		  : this.getDataOfPlainPage();

		const Constructor = isFormPage
		  ? ProductFormPage
		  : this.pages[this.currentPathnameOfPage] ?? UndefinedPage;

		this.showingPage = new Constructor(inputData);

		this.contentContainer.append(this.showingPage.element);

		this.sidebarWrapper.setActiveNavItemHandler(this.currentPathnameOfPage);
		this.toggleProgressbar();

	  } catch (error) {
	    this.toggleProgressbar();
	    errorHandler(error);
	  }

	}

	changePageByCustomEventHandler = (event) => {
	  const { href } = event.detail;
	  this.currentPathnameOfPage = href;

	  this.updateShowingPage();
	}

	changePageByPushStateHandler = () => {
	  this.currentPathnameOfPage = document.location.pathname;
	  this.updateShowingPage();
	}

	selectPageHandler = (event) => {

	  const elementA = event.target.closest('a');

	  const href = elementA?.getAttribute('href') ?? '';

	  if (!elementA) { return; }
	  if (!href.startsWith('/')) { return; }
	  event.preventDefault();
	  window.history.pushState(null, null, href);

	  event.target.dispatchEvent(new CustomEvent('page-selected', {
	    bubbles: true,
	    detail: { href }
	  }));
	}

	setSubElements() {
	  const elements = document.querySelectorAll('[data-element]');

	  for (const element of elements) {
	    const name = element.dataset.element;
	    this.subElements[name] = element;
	  }
	}

	setEventListeners() {
	  this.element.addEventListener('click', this.selectPageHandler);
	  this.element.addEventListener('page-selected', this.changePageByCustomEventHandler);
	  window.addEventListener('popstate', this.changePageByPushStateHandler);

	}

	render() {
	  this.element = this.mainElement;
	  document.body.append(this.element);

	  this.contentContainer = document.querySelector('#content');

	  this.setSubElements();
	  this.setEventListeners();
	  (new Tooltip()).initialize();

	  this.updateShowingPage();
	}
}

