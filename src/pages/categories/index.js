import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';
import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
    element;
    subElements = {};
    usedComponents = {};

    get template() {
        return `
            <div class="content__top-panel">
                <h1 class="page-title">Categories</h1>
            </div>
            <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
            <div data-elem="categoriesContainer">     
            </div>`;
    }

    getCategoryElement(data) {

        const wraper = document.createElement('div');
        wraper.innerHTML = `
            <div class="category category_open" data-id="${data.id}">
                <header class="category__header">
                    ${data.title}
                </header>
                <div class="category__body">
                    <div class="subcategory-list">         
                    </div>
                </div>
            </div>`;

        const subcategories = document.createElement('ul');
        subcategories.innerHTML = this.getSubcategoriesHTML(data.subcategories);
        const sortableList = new SortableList({
            items: subcategories.children
        });
        wraper.querySelector('div.subcategory-list').append(sortableList.element);

        this.usedComponents.arrayOfSortableList.push(sortableList);
        return wraper.firstElementChild;
    }

    getSubcategoriesHTML(subcategories) {
        return subcategories.map(item => `
            <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${item.id}" ondragstart="return false;">
                <strong>${item.title}</strong>
                <span><b>${item.count}</b> products</span>
            </li>`).join();
    }

    fillSubElements() {
        const allDataElem = this.element.querySelectorAll("[data-elem]");
        for (const element of allDataElem) {
            this.subElements[element.dataset.elem] = element;
        }
    }

    sortListChange = event => {

        const subcategoryList = [...event.target.children];
        const data = subcategoryList.map((value, index) => {
            return {
                id: value.dataset.id,
                weight: index + 1
            };
        });

        this.saveOrder(data);

    }

    async saveOrder(data) {

        try {
            const response = await fetchJson(new URL('api/rest/subcategories', BACKEND_URL), {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    "Content-type": 'application/json'
                }
            });
            new NotificationMessage('Category order saved').show();

        } catch (error) {
            new NotificationMessage(`${error}`, {
                type: 'error'
            }).show();
        }

    }


    categoryPanelToggle = event => {
        const categoryPanel = event.target.closest('div.category');
        if (categoryPanel && event.target.classList.contains('category__header')) {
            categoryPanel.classList.toggle('category_open');
        }
    }

    async render() {

        this.element = document.createElement('div');
        this.element.classList.add('categories');
        this.element.innerHTML = this.template;
        this.fillSubElements();

        this.usedComponents.arrayOfSortableList = [];
        const url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL)
        try {
            const data = await fetchJson(url);
            if (!data) {
                throw 'no data';
            }
            data.forEach(item => {
                this.subElements.categoriesContainer.append(this.getCategoryElement(item));
            });
        } catch (error) {

        }

        this.element.addEventListener('sortlist-change', this.sortListChange);
        this.element.addEventListener('click', this.categoryPanelToggle);

        return this.element;
    }

    remove() {
        if (this.element) {
            this.element.remove;
        }
        this.element = null;
    }

    destroy() {
        this.usedComponents.arrayOfSortableList.forEach(value => {
            value.destroy();
        });
        this.remove();
        this.usedComponents = null;
        this.subElements = null;
    }
}