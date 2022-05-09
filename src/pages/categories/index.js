import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';
import fetchJson from '../../utils/fetch-json.js';

class CategoryInfo {
    element;
    subElements = {};

    constructor({
        id = "",
        title = "",
        subcategories = {}
    } = {}) {
        this.id = id;
        this.title = title;
        this.subcategories = subcategories;

        this.render();
        this.initEventListeners();
    }

    getSortableList(subcategories) {
        const sortableList = new SortableList({
            items: subcategories.map(item => {
                const element = document.createElement('li');
                element.classList.add("categories__sortable-list-item");
                element.classList.add("sortable-list__item");
                element.setAttribute("data-grab-handle", "");
                element.setAttribute("data-id", item.id)
        
                element.innerHTML = `
                    <strong>${item.title}</strong>
                    <span><b>${item.count}</b> products</span>
                `
        
                return element;
            })
        });

        return sortableList;
    }

    get template() {
        return `
            <div class="category category_open" data-id="${this.id}">
                <header class="category__header">
                    ${this.title}
                </header>
                <div class="category__body">
                    <div data-element="subcategoryList" class="subcategory-list">
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        const element = document.createElement("div");
        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
        
        const sortableList = this.getSortableList(this.subcategories);
        this.subElements.subcategoryList.append(sortableList.element);

        return this.element;
    }

    categoryHeaderClick = (event) => {
        if (!event.target.classList.contains("category__header"))
            return;

        event.target.parentElement.classList.toggle("category_open");
    }

    async sortableListReorder() {
        let i = 1;
        const newCategories = [...this.subElements.subcategoryList.querySelectorAll("[data-id]")].map(item => ({
            id: item.dataset.id,
            weight: i++
        }));
        const url = new URL("api/rest/subcategories", process.env.BACKEND_URL);
        await fetchJson(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newCategories)
        });

        const notification = new NotificationMessage("Category order saved");
        notification.show();
    }

    initEventListeners () {
        this.element.addEventListener("click", this.categoryHeaderClick);
        this.subElements.subcategoryList.addEventListener("sortable-list-reorder", () => this.sortableListReorder());
    }
    
    removeEventListeners () {
        this.element.removeEventListener("click", this.categoryHeaderClick);
    }

    getSubElements (element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;
    
          return accum;
        }, {});
    }
    
    remove () {
        this.element.remove();
        this.removeEventListeners();
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}

export default class Page {
    element;
    subElements = {};
    components = {};

    get template() {
        return `
            <div class="categories">
                <div class="content__top-panel">
                    <h1 class="page-title">Категории товаров</h1>
                </div>
                <div data-element="categoriesContainer">
                </div>
            </div>
        `;
    }
    
    async render() {
        const element = document.createElement("div");

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        await this.initComponents();
        this.renderComponents();

        return this.element;
    }

    getCategories() {
        const url = new URL("api/rest/categories?_sort=weight&_refs=subcategory", process.env.BACKEND_URL);
        return fetchJson(url);
    }

    async initComponents() {
        const categories = await this.getCategories();
        for (let category of categories) {
            const categoryInfo = new CategoryInfo({
                id: category.id,
                title: category.title,
                subcategories: category.subcategories
            });
            this.components[`categoryInfo_${category.id}`] = categoryInfo;
        }
    }

    renderComponents() {
        for (const categoryInfo of Object.values(this.components)) {
            this.subElements.categoriesContainer.append(categoryInfo.element);
        }
    }

    getSubElements (element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;
    
          return accum;
        }, {});
    }
    
    destroy() {
        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }
}