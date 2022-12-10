import SortableList from "../../components/sortable-list";
import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
    element;
    subElements = {};
    components = {};
    categories;

    constructor() {
        this.urlCategory = new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
    }

    async render() {
        const element = document.createElement('div');

        element.innerHTML = `
          <div class="categories">
            <div class="content__top-panel">
              <h1 class="page-title">Категории товаров</h1>
            </div>
            <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
            <div data-element="categoriesContainer">
            </div>
          </div>`;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements();

        await this.loadData();
        this.renderCategories();

        this.initEventListener();

        return this.element;
    }

    initEventListener() {
        this.subElements.categoriesContainer.addEventListener('pointerup', this.onPointerUp);
    }

    onPointerUp(event) {
        let header = event.target.closest('header');

        if (!header) return;

        header.parentElement.classList.toggle("category_open");
    }

    getSubElements() {
        const result = {};
        const elements = this.element.querySelectorAll("[data-element]");

        for (const subElement of elements) {
            const name = subElement.dataset.element;
            result[name] = subElement;
        }

        return result;
    }

    async loadData() {
        const resultCategoryPromise = fetchJson(this.urlCategory);

        this.categories = await resultCategoryPromise;
    }

    renderCategories() {
        for (const category of this.categories) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
              <div class="category category_open" data-id="${category.id}">
                <header class="category__header">${category.title}</header>
                <div class="category__body">
                  <div class="subcategory-list">
                  </div>
                </div>
              </div>
            `;
            const sortableListSubcategoriesElement = this.getSubcategoriesList(category);
            wrapper.querySelector('.subcategory-list').append(sortableListSubcategoriesElement);

            this.subElements.categoriesContainer.append(wrapper.firstElementChild);
        }
    }

    getSubcategoriesList(category) {
        const items = category.subcategories
            .map(subcategory => this.getSubcategoryItem(subcategory));

        const sortableListSubcategories = new SortableList({ items });

        return sortableListSubcategories.element;
    }

    getSubcategoryItem(subcategory) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
          <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${subcategory.id}">
            <strong>${subcategory.title}</strong>
            <span><b>${subcategory.count}</b> products</span>
          </li>
        `;
        return wrapper.firstElementChild;
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }
}