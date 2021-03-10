import fetchJson from "../../utils/fetch-json";
import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';

export default class Categories {
    element;

    constructor() {
        this.render();
    }

    async render() {
        const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);
        this.data = data;

        this.element = this.template(data);

        this.categoriesContainer = document.querySelector('[data-element="categoriesContainer"]');

        this.categoriesContainer.addEventListener('pointerdown', event =>{
            const parentElement = event.target.closest('.category');
            this.category = parentElement.dataset.category;
        })

        this.element.forEach(item => {
            this.categoriesContainer.append(item);
        });

        this.initEvents();
    }

    initEvents() {
        this.categoriesContainer.addEventListener('click', ({target: currentElement}) => {
            if (currentElement.dataset.element === 'toggleList') {
                const container = currentElement.closest('[data-toggle="container"]');
                container.classList.toggle('category_open');
            }
        })

        document.addEventListener('sortable-list-reorder', async event => {
            let {from, to} = event.detail;

            const step = to - from;

            let newList = [...this.data[this.category].subcategories].map((item, index) => {

                if (index == from) {
                    item.weight += step;
                    return item;
                }

                if (index > from && index !== to + 1) {
                    item.weight -= 1;
                    return item;
                }

                return item;
            });

            try {
                const response = await fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newList)
                });

                const notification = new NotificationMessage('Updated');
                notification.show();

            } catch(err) {
                throw err;
            }
        });
    }

    template(data) {
        return data.map((item, index) => {
            const currentElement = document.createElement('div');

            currentElement.innerHTML = `<div class="category category_open" data-toggle="container" data-category="${index}" data-id="${item.id}">
                <header class="category__header" data-element="toggleList">
                    ${item.title}
                </header>
                <div class="category__body">
                    <div class="subcategory-list" data-element="sublist">
                    </div>
                </div>
            </div>`;

           currentElement.querySelector('[data-element="sublist"]').append(this.subcategory(item.subcategories).element);

           return currentElement.firstElementChild;
        });
    }

     subcategory(data) {
        return new SortableList({
            items: data.map(item => {
                const element = document.createElement('div');

                element.innerHTML =  `<li class="categories__sortable-list-item" data-grab-handle="" data-id="${item.id}">
                    <strong>${item.title}</strong>
                    <span><b>${item.count}</b>products</span>
                </li>`;

                return element.firstElementChild;
            })
        });
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;
    
          return accum;
        }, {});
    }
}
