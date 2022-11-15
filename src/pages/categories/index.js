import CategoryList from '../../components/categories';
import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {

    element;
    subElements = {};
    url = new URL('/api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
    components = [];

    async render() {   
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getHTML();
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();
        
        this.data = await this.loadData();
        this.renderComponents();   
                    
        return this.element;
    }

    getHTML() {
        return `<div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Product categories</h1>
        </div>
        <p>You can drag subcategories to change their order in their category.</p>        
        <!-- Categories component -->
        <div data-element="categoriesContainer"></div>
      </div>`;
    }

    renderComponents() {     
        this.data.map(item => new CategoryList(item)).forEach(item => {
          this.subElements.categoriesContainer.append(item.element);
        });       
    } 
   
    async loadData() {
        const newData = await fetchJson(this.url);  
        return newData;        
      }

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