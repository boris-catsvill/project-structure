import fetchJson from '/project-structure/src/utils/fetch-json';
import SortableList from '../../components/sortable-list';

export default class Categories {

    async render() {
        this.categories = await this.loadCategories()
        this.element = this.getTemplate()
        this.subElements = this.getSubElements(this.element)
        this.initEventListeners()
        this.addSortableList()
        return this.element
    }

    async loadCategories() {
        return await fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`)
    }

    addCategories() {
        return this.categories
            .map(obj => {
                return `
            <div class="category category_open" data-id= ${obj.id}>
                <header class="category__header">
                ${obj.title}
                </header>
                <div class="category__body">
                  <div class="subcategory-list">
                  <ul class="sortable-list">
                  ${this.addSubcategories(obj.subcategories)}
                  </ul>
                  </div>
                </div>
               </div>`
            })
            .join('')
    }


    addSubcategories(obj) {
        return obj
            .map(category => {
                return `<li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
            data-id=${category.id}>
            <strong>${category.title}</strong>
            <span><b>${category.count}</b> products</span>
        </li>`
            })
            .join('')

    }

    initEventListeners() {
        this.element.addEventListener('click', this.onClick)
    }

    onClick = (e) => {
        if (!e.target.classList.contains('category__header')) return
        const categoryParent = e.target.parentNode
        categoryParent.classList.toggle('category_open')
    }

    addSortableList() {
        const CollectionOfList = this.element.querySelectorAll('.sortable-list')
        for (const list of CollectionOfList) {
            const sortable = new SortableList({}, list)
            list.addEventListener('clickOnList', this.sendNewOrderOfCategories)
        }
    }

    sendNewOrderOfCategories = (event) => {
        const newCategories = this.getNewOrderOfCategories(event.detail.list)
        fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCategories)
        });
    }

    getNewOrderOfCategories(liCollection) {
        const newCategories = [];
        let count = 0

        for (const li of liCollection) {
            count++
            const obj = { id: li.dataset.id, weight: count }
            newCategories.push(obj)
        }

        return newCategories
    }

    getTemplate() {
        return this.createElement(`<div class="categories">
        <div class="content__top-panel">
            <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element = "categoriesContainer">
        ${this.addCategories()}
        </div>

    </div>
    `)
    }

    createElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
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
}