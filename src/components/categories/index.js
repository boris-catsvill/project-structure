import SortableList from '../sortable-list';
import NotificationMessage from '../notification';
import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = process.env.BACKEND_URL;

export default class CategoryList {

    element;
    subElements = {};
    subcategoriesList;

    constructor({id = '', title = '', subcategories = [], count = 0, weight = 0}) {
        this.id = id;
        this.title = title;
        this.subcategories = subcategories;
        this.count = count;
        this.weight = weight;
        this.url = new URL('api/rest/subcategories', BACKEND_URL);
        
        this.render();        
    }

    async render() {   
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getHTML();
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();
        this.initEventListeners();
                    
        this.subcategoryItems();
    }
 

    getHTML() {
        return `<div class="category category_open" data-id="${this.id}">
        <header class="category__header">
          ${this.title}
        </header>
        <div class="category__body">
          <div data-element="subcategories" class="subcategory-list"></div>
        </div>
      </div>`;
    }

    subcategoryItems() {
        const items = this.subcategories.map(item => this.getSubcategoryItem(item));
        this.subcategoriesList = new SortableList({items: items});
        this.subElements.subcategories.append(this.subcategoriesList.element)
    }

    getSubcategoryItem({count, id, title}) {
        const wrapper = document.createElement('li');
        wrapper.classList.add('categories__sortable-list-item');
        wrapper.dataset.id = id;
        wrapper.dataset.grabHandle = '';    
        wrapper.innerHTML = `<strong>${title}</strong><span><b>${count}</b> products</span>`;    
        return wrapper;
    }

    initEventListeners() {
        this.element.addEventListener('click', this.onHeaderClick);
        this.element.addEventListener('sortable-list-reorder', this.onSortableListReorder);
    }

    onSortableListReorder = async event => {
        await fetchJson(this.url, {
            headers: {
              'Content-Type': 'application/json'
            },
            body: this.getSubcategoryRequestBody(),
            method: 'PATCH'
          });
        const notificaion = new NotificationMessage('Category order saved');        
        notificaion.show();
    };

    getSubcategoryRequestBody() {
        const resultArray = [];    
        this.element.querySelectorAll('.categories__sortable-list-item').forEach((item, index) => {
          resultArray.push({id: item.dataset.id, weight: index + 1});
        });    
        return JSON.stringify(resultArray);
    }

    onHeaderClick = event => {
        const header = event.target.closest('.category__header');
        if (header) {
            header.parentElement.classList.toggle('category_open');
        }
    };

    getSubElements() {
        const result = {};
        const elements = this.element.querySelectorAll("[data-element]");
    
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
    
    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
        for (const component of this.components) {
          component.destroy();
        }
    }

   
}