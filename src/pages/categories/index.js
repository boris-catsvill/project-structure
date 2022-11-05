import fetchJson from '../../utils/fetch-json.js';
import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

	element;
	subElements;
	url = new URL('/api/rest/categories', BACKEND_URL)
	categories = [];

	get template() {
		return `
		<div class="categories">
			<div class="content__top-panel">
      		<h1 class="page-title">Категории товаров</h1>
      	</div>
			<p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
			<div data-element="categoriesContainer">
			</div>
		</div>
		`;
	}

	async getCategoriesData() {
		this.url.searchParams.set('_sort', 'weight');
		this.url.searchParams.set('_refs', 'subcategory');
		this.categories = await fetchJson(this.url);
	}

	renderCategories() {
		this.categories.map(category => {
			const categoryItem = document.createElement('div');
			const template = `
			<div class="category category_open" data-id=${category.id}>
      		<header class="category__header">
      			${category.title}
      		</header>
      		<div class="category__body">
      		</div>
			</div>
			`;
			categoryItem.innerHTML = template;
			const categoryBody = categoryItem.querySelector('.category__body');
			categoryBody.append(this.getSubCategories(category.subcategories));
			this.subElements.categoriesContainer.append(categoryItem.firstElementChild);
		});
	}

	addEventListeners() {

		this.element.addEventListener('sortable-list-reorder', event => {
			this.updateCategories(event.target);
		});

		this.element.addEventListener('click', event => {
			const header = event.target.closest('.category');
			if (event.target.classList.contains('category__header')) {
				header.classList.toggle('category_open');
			}
		});
	}

	showNotification(type, text) {
		const message = new NotificationMessage(text, {
			duration: 2000,
			type: type
		});
		message.show();
	}

	async updateCategories(data) {
		const subcategories = this.getSubcategoriesOrder(data);
		try {
			await fetchJson(new URL('/api/rest/subcategories', BACKEND_URL), {
				method: 'PATCH',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify(subcategories)
			});
			this.showNotification('success', 'Сохранено');
		} catch (error) {
			this.showNotification('error', 'Произошла ошибка');
		}
	}

	getSubcategoriesOrder(data) {
		const result = [];
		const list = data.querySelectorAll('li');
		list.forEach((item, index) => {
			result.push({
				id: item.dataset.id,
				weight: index + 1
			});
		});
		return result;
	}

	getSubCategories(subCategories) {

		const list = document.createElement('div');

		list.classList.add('subcategory-list');

		const subCategory = new SortableList({
			items: subCategories.map(item => {
				const element = document.createElement('li');
				element.classList.add('categories__sortable-list-item');
				element.dataset.grabHandle = "";
				element.dataset.id = item.id;
				element.innerHTML = `
					<strong>${item.title}</strong>
					<span><b>${item.count}</b> product</span>
					`;
				return element;
			})
		});

		list.append(subCategory.element);

		return list;
	}

	getSubElements() {
		const subElements = this.element.querySelectorAll('[data-element]');

		return [...subElements].reduce((accum, subElement) => {
			accum[subElement.dataset.element] = subElement;

			return accum;
		}, {});
	}

	async render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.template;

		this.element = wrapper.firstElementChild;

		this.subElements = this.getSubElements();

		await this.getCategoriesData();
		this.renderCategories();
		this.addEventListeners();

		return this.element;
	}

	remove() {
		if (this.element) {
			this.element.remove();
		}
	}

	destroy() {
		this.remove();
		this.element = null;
		this.subElements = null;
	}
}