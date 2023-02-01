import SortableList from '../../components/sortable-list';
import NotificationMessage from '../../components/notification';
import fetchJson from '../../utils/fetch-json';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
	element;
	components = {};
	url = new URL('api/rest/categories', BACKEND_URL);
	categories = [];

	async getTemplate() {
		return `
			<div class="categories">
				<div class="content__top-panel">
					<h1 class="page-title">Категории товаров</h1>
				</div>
				<p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
				<div data-element="categoriesContainer">
					${await this.getCategoriesList()}
				</div>
			</div>
		`;
	}

	async render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = await this.getTemplate();

		this.element = wrapper.firstElementChild;

		this.getListItem();
		this.initEventListeners();
 
		return this.element;
	}

	loadCategories() {
		this.url.searchParams.set('_sort', 'weight');
		this.url.searchParams.set('_refs', 'subcategory');

		return fetchJson(this.url);
	}

	async getCategoriesList() {
		const data = await this.loadCategories();

		return data.map(item => {
			this.createListItem(item.subcategories)

			return `
				<div class="category category_open" data-id="${item.id}">
					<header class="category__header">${item.title}</header>
					<div class="category__body">
						<div class="subcategory-list"></div>
					</div>
				</div>
			`;
		}).join('');
	}

	createListItem(subcategories) {
		const listItem = new SortableList({
			items: subcategories.map(item => {
				const wrapper = document.createElement('div');

				wrapper.innerHTML = `
					<li class="categories__sortable-list-item" data-grab-handle data-id="${item.id}">
						<strong>${item.title}</strong>
						<span>
							<b>${item.count}</b>
							продуктов
						</span>
					</li>
				`;

				return wrapper.firstElementChild;
			})
		});

		this.categories.push(listItem.element);
	}

	getListItem() {
		const lists = this.element.querySelectorAll('.subcategory-list');
		let count = 0;

		for (const list of lists) {
			list.append(this.categories[count]);

			count++;
		}
	}

	initEventListeners() {
		this.element.addEventListener('click', event => {
			const header = event.target.closest('.category__header');
			const category = event.target.closest('.category');

			if (header) {
				category.classList.toggle('category_open');
			}
		});

		this.element.addEventListener('sortable-list-reorder', event => this.showNotification('Порядок категорий изменён', event));
	}

	showNotification(string, event) {
		console.log(event)

		const notification = new NotificationMessage(string, {
			duration: 2000,
			type: 'success'
		});

		notification.show();
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}