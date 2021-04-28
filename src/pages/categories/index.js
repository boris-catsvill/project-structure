import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';
import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;
const API_URL_CATEGORIES = 'api/rest/categories';
const API_URL_SUBCATEGORIES = 'api/rest/subcategories';

export default class CategoriesPage {
	constructor() {

		this.render();
		this.initEventListeners();
	}

	getTemplate() {
		return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-element="categoriesContainer" class="categoriesContainer"></div>
      </div>
    `;
	}

	getCategoriesContainers() {
		const { categoriesContainer } = this.subElements;
		const categoriesContainers = categoriesContainer.querySelectorAll(`[data-id]`);

		const result = {};

		categoriesContainers.forEach((category) => {
			result[category.dataset.id] = category;
		})

		return result;
	}

	async render() {
		const element = document.createElement('div');

		element.innerHTML = this.getTemplate;

		this.element = element.firstElementChild;
		this.subElements = this.getSubElements(element);

		this.categories = await this.getCategories();
		this.renderCategories(this.categories);

		return this.element;
	}

	async getCategories() {
		const url = new URL(`${API_URL_CATEGORIES}`, BACKEND_URL);
		url.searchParams.set(`_sort`, `weight`);
		url.searchParams.set(`_refs`, `subcategory`);

		return fetchJson(url.href);
	}

	renderCategories(categories) {
		const { categoriesContainer } = this.subElements;

		const categoriesResult = categories
			.map(({ id, title }) => {
				return `
        	<div class="category category_open" data-id="${id}">
        	    <header class="category__header">
        	        ${title}
        	    </header>
        	    <div class="category__body">
        	        <div class="subcategory-list"></div>
        	    </div>
        	</div>
        `;
			})
			.join('');

		categoriesContainer.innerHTML = categoriesResult;

		this.addSubcategories(categories);
	}

	addSubcategories(categories) {
		const categoriesContainers = this.getCategoriesContainers();

		categories.forEach(({ id, subcategories }) => {
			const sortableList = new SortableList({
				items: subcategories.map(this.renderSubcategoryItem)
			});

			categoriesContainers[id]
				.querySelector('.subcategory-list')
				.append(sortableList.element);
		});
	}

	renderSubcategoryItem({ id, title, count }) {
		const element = document.createElement('div');

		element.innerHTML = `
                <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${id}">
                    <strong>${title}</strong>
                    <span><b>${count}</b> products</span>
                </li>
        `;

		return element.firstElementChild;
	}

	onPointerDown = event => {
		const categoryHeader = event.target.closest('.category__header')
		if (categoryHeader) {
			categoryHeader.closest('.category')
				.classList
				.toggle('category_open');
		}
	}

	onSortableListReorder = async ({ detail: list }) => {
		const data = [...list.children]
			.map((item, index) => ({
				id: item.dataset.id,
				weight: index + 1
			}));

		try {
			await fetchJson(`${BACKEND_URL}${API_URL_SUBCATEGORIES}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			this.renderNotification('Порядок категорий сохранен!');
		} catch (e) {
			this.renderNotification('Порядок категорий не сохранен!', 'error');
		}
	}

	initEventListeners() {
		const { categoriesContainer } = this.subElements;

		categoriesContainer.addEventListener('sortable-list-reorder', this.onSortableListReorder);

		document.addEventListener('pointerdown', this.onPointerDown);
	}

	renderNotification(message, type = 'success') {
		const notification = new NotificationMessage(message, {
			duration: 2000,
			type
		});
		notification.show();
	}

	removeEventListeners() {
		document.removeEventListener('pointerdown', this.onPointerDown);
	}

	getSubElements(element) {
		const result = {};
		const elements = element.querySelectorAll('[data-element]');

		for (const subElement of elements) {
			const name = subElement.dataset.element;

			result[name] = subElement;
		}

		return result;
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();

		this.removeEventListeners();
	}
}