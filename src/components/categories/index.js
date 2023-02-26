import SortableList from '../sortable-list/index.js';
import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = `${process.env.BACKEND_URL}`

export default class Categories {

    onClick = (event) => {
        event.preventDefault();
        const elem = event.target.closest('.category__header');
        if (elem) {
            elem.parentNode.classList.toggle("category_open");
        }
    }

    constructor() {

    }

    async render() {

        this.data = await this.getCategories();     

        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;

        this.subElements = this.getSubElements();

        this.fillSubCategories();
        this.initEventListeners();

        return this.element;
    }

    getTemplate() {
        return `
        <div>
        ${this.data.map(elem => {
            return `
            <div class="category category_open" data-id="${elem.id}" data-element="${elem.id}">
                <header class="category__header">${elem.title}</header>
                <div class="category__body">
                    <div class="subcategory-list">
                        
                    </div>
                </div>
            </div>
            `
        }).join('')}
        </div>
        `
    }

    fillSubCategories() {
        this.data.forEach(elem => {
            this.subElements[elem.id][1].append(this.getSubCategories(elem.subcategories));
        })
    }

    getSubCategories(subCategories) {
        const items = subCategories.map( elem => this.getElementList(elem.id, elem.title, elem.count));
        const elementList = new SortableList({items: items});
        return elementList.element; 
      }

    getElementList(id, title, count) {
        const element = document.createElement('div');
        element.innerHTML = this.getTemplateElementList(id, title, count);
        return element.firstElementChild;
      }

    getTemplateElementList(id, title, count) {
        return `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${id}" style="">
            <strong>${title}</strong>
            <span><b>${count}</b> products</span>
        </li> 
        `
    }

    getSubElements() {
        const result = {};
        const elements = this.element.querySelectorAll("[data-element]");
    
        for (const subElement of elements) {
          const root = subElement.querySelector('.subcategory-list');
          const name = subElement.dataset.element;
          result[name] = [subElement, root];
        }
        return result;
      }

    initEventListeners() {
        Object.values(this.subElements).forEach( value => {
            value[0].addEventListener('pointerdown', this.onClick)
        }
        )
    }

    async getCategories() {
        const url = new URL(BACKEND_URL);
        url.pathname = '/api/rest/categories';
        url.searchParams.set('_sort','weight');
        url.searchParams.set('_refs','subcategory');
        return await this.loadData(url); ;
      }
    
    async loadData(url) {
        const data = await fetchJson(url);
        return data;
      }

    remove() {
        this.element.remove();
    }

    destroy() {
        
        Object.values(this.subElements).forEach( value => {
            value[0].removeEventListener('pointerdown', this.onClick)
        });

        this.remove();
    }
}