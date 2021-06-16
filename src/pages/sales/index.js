import SortableTable from '../../components/sortable-table/index.js';
import RangePicker from '../../components/range-picker/index.js';
import header from './header.js';


export default class Page {

   element;
   subElements = {};
   components = {};

   async initComponents() {

      const now = new Date();

      const from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      const to = now

      const rangePicker = new RangePicker({
         from,
         to
      });

      const ordersContainer = new SortableTable(header, {
         url: `api/rest/orders`,
         rowTag: 'div',
      });

      ordersContainer.setDateRange({ from, to })
      ordersContainer.render();

      this.components = {
         rangePicker,
         ordersContainer,
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
      <div class="sales full-height flex-column">
		   <div class="content__top-panel">
		   	<h1 class="page-title">Продажи</h1>
			   <div data-element="rangePicker"></div>
				  
				<div class="rangepicker__selector" data-elem="selector"></div>
			</div>
		   <div data-element="ordersContainer" class="full-height flex-column">

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

   async updateComponents() {

      this.components.ordersContainer.updata();
   }

   initEventListeners() {

      this.components.rangePicker.element.addEventListener('date-select', event => {

         const { from, to } = event.detail;
         this.components.ordersContainer.setDateRange({ from, to })
         this.updateComponents()
      });
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
