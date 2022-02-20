
import Categories from '../../components/categories/index.js';
import NotificationMessage from '../../components/notification/index.js'
import fetchJson from '../../utils/fetch-json.js';
const BACKEND_URL = `${process.env.BACKEND_URL}`

export default class Page {

   element;
   subElements = {};
   components = {};

   async initComponents() {

      const data = await fetchJson(`${BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);

      const categories = new Categories({
         data: data
      });

      this.components = {
         categories
      }

      this.renderComponents()
      this.initEventListeners()
   }

   render() {

      const element = document.createElement('div');

      element.innerHTML = this.template();

      this.element = element.firstElementChild;

      this.subElements = this.getSubElements(element);

      this.initComponents()

      return this.element
   }

   renderComponents() {

      for (const [component, { element }] of Object.entries(this.components)) {

         this.subElements[component].append(element)
      }
   }

   template() {
      return `
		<div class="categories" data-element="categories">
		   <div class="content__top-panel">
			   <h1 class="page-title">Категории товаров</h1>
		   </div>
		  
	   </div>
       `
   }

   getSubElements(element) {

      const elements = element.querySelectorAll('[data-element]');

      return [...elements].reduce((result, item) => {

         result[item.dataset.element] = item;
         return result;

      }, {})
   }

   initEventListeners() {

      this.subElements = this.getSubElements(this.element);

      this.subElements.categoriesContainer.addEventListener('order-saved', (event) => {

         const notification = new NotificationMessage('Category order saved', {
            duration: 2000,
            type: 'success'
         });

         notification.show();
      })

   }

   remove() {
      this.element.remove();
   }

   destroy() {
      this.remove();

      for (const component of Object.values(this.components)) {
         component.destroy();
      }
   }

}
