import fetchJson from '/project-structure/src/utils/fetch-json';
import SortableList from '../../components/sortable-list';

export default class Categories {

    async render() {
        this.categories = await this.loadCategories()
        this.element = this.getTemplate()
        this.subElements = this.getSubElements(this.element)
        this.initEventListeners()
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
                  </ul></div>
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
        this.element.addEventListener('pointerdown', this.addSortableList)
    }

    onClick = (e) => {
        if (!e.target.classList.contains('category__header')) return
        const categoryParent = e.target.parentNode
        categoryParent.classList.toggle('category_open')


    }

    addSortableList = (e) => {
        if (!e.target.closest('.sortable-list__item')) return

        let targetList = e.target.closest('.sortable-list')
        const sortable = new SortableList({}, targetList)
        /* возникает ошибка при инициализации класса  */
        /* Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
    at HTMLDocument.addEventPointerDown 
    на 107 строчке в компонетн sortable list
    
    */

        targetList.addEventListener('clickOnList', this.sendNewCategories)

    }

    sendNewCategories = (event) => {
        const collectionOfLi = event.detail.list
        console.log(collectionOfLi) /* при нажатии на один и тот же li  в консоль выводится множество ul */
        /* далее думала проитерироваьт коллекцию li, и уже по их id сформировать запрос на сервер */
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