import SortableList from '../../components/sortable-list';
import NotificationMessage from '../../components/notification';
import fetchJson from '../../utils/fetch-json';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  components = {};
  url = new URL('api/rest/categories', BACKEND_URL);
  categories = [];

  async render() {
    const categoriesWrapper = document.createElement('div');
    categoriesWrapper.innerHTML = await this.getCategoriesHTML();
    this.element = categoriesWrapper.firstElementChild;

    this.appendCategories();
    this.initEventListeners();

    return this.element;
  }

  async getCategoriesHTML() {
    return `
			<div class="categories">
				<div class="content__top-panel">
					<h1 class="page-title">Категории товаров</h1>
				</div>
				<div data-element="categoriesContainer">
					${await this.getCategories()}
				</div>
			</div>`;
  }

  async getCategories() {
    const data = await this.loadCategories();

    return data.map(item => {
      this.createCategories(item.subcategories)

      return `
				<div class="category category_open" data-id="${item.id}">
					<header class="category__header">
            ${item.title}
          </header>
					<div class="category__body">
						<div class="subcategory-list">
            </div>
					</div>
				</div>`;
    }).join('');
  }

  createCategories(subcategories) {
    const sortableList = new SortableList({
      items: subcategories.map(subCategory => {
        const subCategoryWrapper = document.createElement('div');
        subCategoryWrapper.innerHTML = `
					<li class="categories__sortable-list-item" data-grab-handle data-id="${subCategory.id}">
						<strong>${subCategory.title}</strong>
						<span><b>${subCategory.count}</b> products</span>
					</li>`;
        return subCategoryWrapper.firstElementChild;
      })
    });

    this.categories.push(sortableList.element);
  }

  loadCategories() {
    this.url.searchParams.set('_sort', 'weight');
    this.url.searchParams.set('_refs', 'subcategory');

    return fetchJson(this.url);
  }

  appendCategories() {
    let count = 0;
    this.element.querySelectorAll('.subcategory-list').forEach(list => {
      list.append(this.categories[count++]);
    });
  }

  initEventListeners() {
    this.element.addEventListener('click', event => {
      if (event.target.closest('.category__header')) {
        event.target.closest('.category').classList.toggle('category_open');
      }
    });
    this.element.addEventListener('sortable-list-reorder', event => {
      this.showNotification('Порядок категорий изменён', event)
    });
  }

  showNotification(string, event) {
    const notification = new NotificationMessage(string, {
      duration: 2000,
      type: 'success'
    });
    notification.show();
  }

  destroy() {
    Object.values(this.components).forEach(component => component.destroy());
  }
}
