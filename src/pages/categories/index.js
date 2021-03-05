import SortableList from "../../components/sortable-list"
import fetchJson from "../../utils/fetch-json";
import '../../components/categories/style.css'

export default class Page {
	element;
	subElements = {};
	components = {};
	categories = [];

	async loadCategories() {
		const categoriesURL = new URL(`${process.env.BACKEND_URL}api/rest/categories`, process.env.BACKEND_URL);
		categoriesURL.searchParams.set('_sort', 'weight');
		categoriesURL.searchParams.set('_refs', 'subcategory');
		this.categories = await fetchJson(categoriesURL);
	}

	async initComponents() {
		await this.loadCategories();
		this.subElements.categories.innerHTML = `${this.categories.map((category) => { return this.getCategory(category) }).join('')}`;
	}

	async render() {
		const element = document.createElement('div');
		element.innerHTML = this.template;
		this.element = element;
		this.subElements = this.getSubElements(this.element);
		await this.initComponents();
		this.renderComponents();
		this.initEventListeners();
		return this.element;
	}

	get template() {
		return `
			<div class="categories">
				<div class="content__top-panel">
					<h1 class="page-title">Категории товаров</h1>
				</div>
				<div data-element="categories"></div>
			</div>
		`;
	}
	renderComponents() {
		const listContainers = this.element.querySelectorAll('.subcategory-list');
		listContainers.forEach((container, index) => {
			const { subcategories } = this.categories[index];
			const listElements = subcategories.map((subcategory) => { return this.getItem(subcategory) });
			const sortableList = new SortableList({items: listElements});
			container.append(sortableList.element);
			this.components[index] = sortableList;
		});
	}
	getSubElements (element) {
		const elements = element.querySelectorAll('[data-element]');
		return [...elements].reduce((accum, item) => {
			accum[item.dataset.element] = item;
			return accum;
		}, {});
	}

	getCategory({id, title}) {
		return `
			<div class="category category_open" data-id="${id}">
			<header class="category__header">${title}</header>
			<div class="category__body">
				<div class="subcategory-list"></div>
			</div>
			</div>
		`;
	}
	getItem({id, title, count}) {
		const element = document.createElement('div');
		element.innerHTML = `
			<li class="categories__sortable-list-item" data-grab-handle="" data-id="${id}">
			<strong>${title}</strong>
			<span><b>${count}</b> products</span>
			</li>
		`;
		return element.firstElementChild;
	}

	initEventListeners() {
		this.element.addEventListener('pointerdown', (event) => {
			const categoryHeader = event.target.closest('.category__header');
			if (categoryHeader) {
				categoryHeader.parentElement.classList.toggle('category_open');
			}
		});
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}