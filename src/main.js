
import DashboardPage from "./pages/DashBoardPage/DashBoardPage.js";
import SalesPage from './pages/SalesPage/SalesPage.js';
import CategoriesPage from './pages/CategoriesPage/CategoriesPage.js';
import ProductsPage from './pages/ProductsPage/ProductsPage.js';
import ProductFormPage from './pages/ProductFormPage/ProductFormPage.js';
import UndefinedPage from './pages/UndefinedPage.js';

import NotificationMessage from "./components/Notification.js";
import Sidebar from "./components/Sidebar.js";
import Tooltip from './components/Tooltip.js';

import errorHandler from "./store/errorHandler.js";

import Router from "./pages/Router.js";
import SortableTable from "./components/SortableTable.js";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
	static currentAdminPage

	range = {}
	subElements = {}
	contentContainer = null
	activePage = null

	router = new Router();
	tooltip = new Tooltip();
	sidebar = new Sidebar();

	constructor() {
		if (Page.currentAdminPage) { return Page.currentAdminPage; }
		Page.currentAdminPage = this;

		this.range = this.createRange();

		this.initialize();
	}

	createRange() {
		const firstDate = new Date();
		const secondDate = new Date();

		const monthOfSecondDate = secondDate.getMonth();
		firstDate.setMonth(monthOfSecondDate - 1);

		return { from: firstDate, to: secondDate };
	}

	get elementDOM() {
		const wrapper = document.createElement('div');
		const bodyOfWrapper = `
			<main class="main">
				<div class="progress-bar" data-element="progressBar" hidden>
					<div class="progress-bar__line"></div>
				</div>
				<section class="content" id="content"></section>
			</main>`;

		wrapper.innerHTML = bodyOfWrapper;

		return wrapper.firstElementChild;
	}

	setSubElements() {
		const elements = this.element.querySelectorAll('[data-element]');

		for (const element of elements) {
			const name = element.dataset.element;
			this.subElements[name] = element;
		}
	}

	toggleProgressbar() {
		const { progressBar } = this.subElements;
		progressBar.hidden = !progressBar.hidden;
	}

	updateActivePage = async () => {
		try {
			this.toggleProgressbar();
			const activePage = this.router.activePage;
			activePage.render(this, this.range);
			
			this.contentContainer.append(activePage.element);
			this.sidebar.setActiveNavItemHandler(document.location.pathname);

			await activePage?.update();
			console.log('updated')
			this.toggleProgressbar();

		} catch (error) {
			this.toggleProgressbar();
			//errorHandler(error);
		}
	}

	setEventListeners() {
		window.addEventListener('page-selected', this.updateActivePage)
	}

	render() {
		this.element = this.elementDOM;
		this.setSubElements();

		this.contentContainer = this.element.querySelector('#content');

		this.element.append(this.sidebar.element)
		document.body.append(this.element);

		this.setEventListeners();
		this.updateActivePage();
	}


	initialize() {
		this.router
			.addRoute(/^\/$/, DashboardPage)
			.addRoute(/^\/products$/, ProductsPage)
			.addRoute(/^\/products\/add$/, ProductFormPage)
			.addRoute(/^\/products\/([\w()-]+)$/, ProductFormPage)
			.addRoute(/^\/sales$/, SalesPage)
			.addRoute(/^\/categories$/, CategoriesPage)
			.setUndefinedPage(UndefinedPage)
			.listen();

		this.tooltip.initialize();
		this.sidebar.render();
		this.render();
	}
}

