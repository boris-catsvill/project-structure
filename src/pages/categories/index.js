//import SortableList from "../components/sortable-list/index.js";
//import fetchJson from "../utils/fetch-json.js";  
import Categories from "../../components/categories/index.js";
import fetchJson from "../../utils/fetch-json.js"; 

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {

    element;
    subElements = {};
    components = {};

    constructor() {

    }

//    async updateComponents(from, to) {
//        const data = await fetchJson(`${BACKEND_URL}/api/rest/categories`)
//        this.components.categories.addRows(data);
//    }
    initComponents() {

        const categories = new Categories( {
             url: '/api/rest/categories',   
             refs: 'subcategory',
             sort: 'weight'
        });

        this.components = {
            categories
        };

    }

    randerComponents() {
        Object.keys(this.components).forEach(component => {
            const root = this.subElements[component];
            const { element } = this.components[component];

            root.append(element);
        });
    }

    get template() {
        return `
        <div class="content" id="content">
          <div data-element="categories">
          </div>
        <div>
        `
    }
     render() {
        
        this.element = document.createElement('div'); // (*)
        this.element.innerHTML = this.template;
        this.element = this.element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initComponents();
        this.randerComponents() ;
        return this.element;
     }

     getSubElements(element) {
         const elements = element.querySelectorAll('[data-element]');

         return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;

          return accum;
        }, {});
     }

     initEventListener() {
         this.components.rangePicker.element.addEventListener('date-select', event => {  
            const {from, to } = event.detail;
            this.updateComponents(from, to);
        });
     }


      remove () {
        if (this.element) {
            this.element.remove();
        }
     }

      // NOTE: удаляем обработчики событий, если они есть
      destroy() {
        this.remove();
        for(let component in this.components) {
            this.components[component].destroy();
        }
        this.element = null;
        this.subElements = {};
      }
}