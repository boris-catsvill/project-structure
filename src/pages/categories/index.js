import SortableList from '../../components/sortable-list/index.js';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
    constructor({ url = 'api/rest/categories', sort = 'weight', refs = 'subcategory' } = {}) {
        this.url = new URL(url, BACKEND_URL);
        this.sort = sort;
        this.refs = refs;
        this.render();
    }

    async render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;
        await this.loadData();
        wrapper.remove();

        this.initEventListeners();

        return this.element;
    }

    getTemplate() {
        return `
            <div class="categories">
                <div class="content__top-panel">
                    <h1 class="page-title">Категории товаров</h1>
                </div>
                <div data-elem="categoriesContainer"></div>
            </div>
        `;
    }

    async loadData() {
        this.url.searchParams.set('_sort', this.sort);
        this.url.searchParams.set('_refs', this.refs);
        const response = await fetch(this.url);
        const data = await response.json();
        
        this.insertData(data);
    }

    insertData(data) {
        const targetElem = this.element.querySelector('[data-elem="categoriesContainer"]');

        data.forEach(item => {
            targetElem.append(this.getCategory(item));
        });
    }

    getCategory(item) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getCategoryTemplate(item);
        const subcategories = this.getCategorySubCategories(item);
        const sortableList = new SortableList({ items: subcategories });
        wrapper.querySelector('.subcategory-list').append(sortableList.element);
        
        return wrapper.firstElementChild;
    }

    getCategoryTemplate(item) {
        return `
            <div class="category category_open" data-id=${item.id}>
                <header class="category__header">
                ${item.title}
                </header>
                <div class="category__body">
                    <div class="subcategory-list"></div>
                </div>
            </div>
        `;
    }

    getCategorySubCategories(item) {
        const listItems = [];

        for (const subcategory of Object.values(item.subcategories)) {
            const listItem = document.createElement('li');
            listItem.className = 'categories__sortable-list-item';
            listItem.dataset.grabHandle = '';
            listItem.dataset.id = subcategory.id;
            listItem.innerHTML = `
                <strong>${subcategory.title}</strong>
                <span><b>${subcategory.count}</b> products</span>
            `;
            
            listItems.push(listItem);
        }

        return listItems;
    }

    initEventListeners() {
        this.element.addEventListener('pointerdown', (evt) => {
            if (!evt.target.classList.contains('category__header')) return;
            evt.target.closest('.category').classList.toggle('category_open');
        });
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}