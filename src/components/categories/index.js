import SortableList from '../sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';
const BACKEND_URL = `${process.env.BACKEND_URL}`

export default class Categories {

   onPointerDown = (event) => {
      const target = event.target.closest('.category__header')

      if (!target) return

      target.closest('.category').classList.toggle('category_open')
   }

   constructor({
      data = [],

   } = {}) {

      this.data = data;

      this.render()
      this.initEventListeners()
   }

   get template() {
      return `
      <div data-element="categoriesContainer">
       
      </div>
        `
   }

   getSubCategories(subcategories) {

      return new SortableList({

         items: subcategories.map(({ id, title, count }) => {

            const element = document.createElement('div');

            element.innerHTML = `
               <li class="categories__sortable-list-item sortable-list__item" 
                              data-grab-handle=""
                              data-id="${id}" >
                  <strong>${title}</strong>
                  <span><b>${count}</b> products</span>
               </li>
           `
            return element.firstElementChild;
         })
      })

   }
   getCategories() {

      return this.data.map(({ id, title, subcategories }) => {

         const sortableList = this.getSubCategories(subcategories)

         let element = document.createElement('div');

         element.innerHTML = `<div class="category category_open" data-id="${id}">
              <header class="category__header">
                 ${title}
              </header>
              <div class="category__body">
                  <div class="subcategory-list">
                 
                   </div>
              </div>
           </div>`

         element = element.firstElementChild;

         element.querySelector('.subcategory-list').append(sortableList.element)
         return element
      });
   }

   render() {

      let element = document.createElement('div');

      element.innerHTML = this.template;

      this.element = element.firstElementChild;

      this.subElements = this.getSubElements(element);

      const categories = this.getCategories();

      for (const category of categories) {

         this.subElements.categoriesContainer.append(category)
      }

      return this.element
   }

   getSubElements(element) {

      const elements = element.querySelectorAll('[data-element]');

      return [...elements].reduce((result, item) => {

         result[item.dataset.element] = item;
         return result;
      }, {})
   }

   initEventListeners() {

      this.subElements.categoriesContainer.addEventListener('pointerdown', this.onPointerDown)
      this.subElements.categoriesContainer.addEventListener('order-changed', (event) => {

         this.save(event.detail)

      })
   }

   async save(newOrder) {

      const response = await fetchJson(`${BACKEND_URL}api/rest/subcategories`, {
         method: "PATCH",
         headers: {
            "Content-Type": "application/json"
         },

         body: JSON.stringify(newOrder)
      });

      this.dispatchEvent(response);
   }

   dispatchEvent(newOrder) {

      this.element.dispatchEvent(new CustomEvent("order-saved", {
         bubbles: true,
         detail: newOrder
      })
      )
   }

   removeEventListeners() {

      this.subElements.categoriesContainer.removeEventListener('pointerdown', this.onPointerDown)
   }

   remove() {
      if (this.element) {
         this.element.remove();
      }
   }

   destroy() {
      this.remove();
      this.element = null;
      this.removeEventListeners()
   }
}