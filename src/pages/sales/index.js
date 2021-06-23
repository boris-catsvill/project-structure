import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './rest-header.js';
import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = `${process.env.BACKEND_URL}`; 

export default class Page {
    element;
    subElements = {};
    components = {};

    constructor() {

    }

    async updateTable(from, to) {
        this.components.sortableTable.url.searchParams.set('createdAt_gte', from);
        this.components.sortableTable.url.searchParams.set('createdAt_lte', to);
        this.components.sortableTable.url.searchParams.set('_sort',  this.components.sortableTable.sorted.id);
        this.components.sortableTable.url.searchParams.set('_order',  this.components.sortableTable.sorted.order);
        this.components.sortableTable.url.searchParams.set('_start',  this.components.sortableTable.start);
        this.components.sortableTable.url.searchParams.set('_end',  this.components.sortableTable.end);
        const data = await fetchJson(this.components.sortableTable.url);
//        const arr = data.filter(item => 
//           item.quantity > this.from && item.quantity < this.to 
//       );
        this.components.sortableTable.addRows(data);
    }

   initComponents() {
        let now = new Date(); 
        let from = new Date(); 
        const to = new Date( now.setMonth( now.getMonth() - 1 ) );
        const rangePicker = new RangePicker( {from, to } );

        const sortableTable = new SortableTable(header, {
            url: `/api/rest/orders`,  
            isSortlocaly: true
        });


        this.components = {
            rangePicker,
            sortableTable,
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
        return ` <div class="sales full-height flex column">
                   <div class="content__top-panel">
                     <h1 class="page_title">Продажи</h1>
                     <!---  -->
                     <div data-element="rangePicker">
                     </div>
                   </div>

                   <div data-element="sortableTable">
                   <!---  -->
                   </div>
                </div>
               `
    }
     render() {
        
        this.element = document.createElement('div'); // (*)
        this.element.innerHTML = this.template;
        this.element = this.element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initComponents();
        this.randerComponents() ;
        this.initEventListener();
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
            this.updateTable(from, to);
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

//export class SortableTableSales extends SortableTable {
//    range: { from, to };
//    
//    constructor(headersConfig = [], {
//        url = '',
//        sorted = {
//          id: headersConfig.find(item => item.sortable).id,
//          order: 'asc'
//        },
//        isSortLocally = false,
//        step = 20,
//        start = 1,
//        end = start + step,
//        range = {
//          from: new Date(),
//          to: new Date()
//        }
//    } = {})) {
//        
//        super(headersConfig = [], {
//            url = '',
//            sorted = {
//              id: headersConfig.find(item => item.sortable).id,
//              order: 'asc'
//            },
//            isSortLocally = false,
//            step = 20,
//            start = 1,
//            end = start + step
//        );
//        this.range = range;
//    }

//    async loadData(id, order, start = this.start, end = this.end) {
//        this.url.searchParams.set('createdAt_gte', this.from);
//        this.url.searchParams.set('createdAt_lte', this.from);
//        this.url.searchParams.set('_sort', id);
//        this.url.searchParams.set('_order', order);
//        this.url.searchParams.set('_start', start);
//        this.url.searchParams.set('_end', end);

//        this.element.classList.add('sortable-table_loading');

//        const data = await fetchJson(this.url); // n кол-во времени

//        this.element.classList.remove('sortable-table_loading');
//    //    console.log(this.url);
//    //    console.log(data);
//        return data;
//   }
//}