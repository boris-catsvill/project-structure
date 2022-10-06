import fetchJson from '../dashboard/utils/fetch-json.js';
import SortableList from '../../components/sortable-list/index.js';
import Notification from '../../components/notification/index.js';
import select from '../../utils/select.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Categories {
    element;
    subElements = {};

    getTeamplate () {
        return `
        <div class="categories">
            <div data-element="headerTitle" class="content__top-panel">
                <h1 class="page-title">Product categories</h1>
            </div>
            <p data-element="header">Subcategories can be dragged and dropped to change their order within their category.</p>
        
            <div data-element="categoriesContainer"></div>
        </div>
        `
    }

    async createElementCategories () {
        const data = await fetchJson(BACKEND_URL + 'api/rest/categories?_sort=weight&_refs=subcategory');
        
        let itog = [];    
        
        for (const elem of data) {
            const categoryBody = this.createElementBody(elem);

            const listCategoryBody = categoryBody.querySelector('[data-elem="list"]');

            const items = Array.from(this.createList(elem));
            const sortableList = new SortableList({items});

            listCategoryBody.append(sortableList.element)
            
            itog.push(categoryBody)
        }  
        
        return itog;
    }

    createElementBody (data) {
        const wrapper = document.createElement('div');

        wrapper.innerHTML = `
            <div class="category category_open" data-id="${data.id}">
                <header class="category__header">
                     ${data.title}
                </header>

                <div class="category__body">
                    <div data-elem="list" class="subcategory-list">
                        
                    </div>
                </div>
            </div>
        `
        return wrapper.firstElementChild;
    }

    createList (data) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = ``;
        let i = data.subcategories;
        
        for (let item of i) {
            const e = `
            <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${item.id}">
                <strong>${item.title}</strong>
                <span>
                    <b>${item.count}</b>
                    products
                </span>
            </li>
            `
            wrapper.innerHTML += e;
        }

        return wrapper.children;
    }

    async createBody () {
        const {categoriesContainer} = this.subElements;
        const elements = await this.createElementCategories();
        elements.map(item => categoriesContainer.append(item));
    }

    async render () {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTeamplate();

        const element = wrapper.firstElementChild;
        this.element = element;

        this.subElements = this.getSubElements();
        select();

        await this.createBody()

        this.initEventListeners();
        return this.element;
    }

    initEventListeners () {
        const headers = this.subElements.categoriesContainer.querySelectorAll('header');

        headers.forEach(item => item.addEventListener('click', (event) => {
            const elem = event.target.parentElement;

            if (elem.classList.contains('category_open')) {
                elem.classList.remove('category_open');
            } else elem.classList.add('category_open');
        }));

        window.addEventListener('sortable-list-reorder', (event) => {
            const target = event.target;

            this.save(target);
            this.createNotification(target);
        });
    }

    createNotification (target) {
        const massage = 'Category order saved';
        const notification = new Notification(massage, {
            duration: 2000,
            type: 'success'
        });

        notification.show(target);
    }

    async save (target) {
        const data = this.createArrList(target);

        try {
            const result = await fetchJson(`${BACKEND_URL}api/rest/subcategories`, {
                method: `PATCH`,
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('ой-ой', error);
        }
    } 

    createArrList (target) {
        const arr = [];
        
        const children = target.children;
        
        for (let i = 0; i < children.length; i++) {
            const obj = {
                id: children[i].dataset.id,
                weight: i + 1
            }

            arr.push(obj);
        }

        return arr;
    }

    getSubElements () {
        const result = {};
        const elements = this.element.querySelectorAll('[data-element]');
    
        for (const subElement of elements) {
          const name = subElement.dataset.element;
    
          result[name] = subElement;
        }

        return result;
      }

    remove() {
        if (this.element) {
          this.element.remove();
        }
    }

    destroy () {
        this.remove();
        this.subElements = {};
        this.element = null;
    }
}