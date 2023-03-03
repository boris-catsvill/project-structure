import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

    element = null;
    subElements = {};
    components = {};
    url = new URL('api/rest/orders',BACKEND_URL);
    sorted = {
        id: 'createdAt',
        order: 'desc'
    }

    async loadData(from,to){
          
        this.url.searchParams.set('createdAt_gte',from.toISOString());
        this.url.searchParams.set('createdAt_lte',to.toISOString());

        const data = await fetchJson(this.url);
      
        return data;
    }

    async updateComponents(from,to){

        const data = await this.loadData(from,to);
     
        this.components.ordersContainer.subElements.body.innerHTML = '';
        this.components.ordersContainer.tableData =[];
        this.components.ordersContainer.url = this.url;
        this.components.ordersContainer.update(data);

    }

    initComponents(){

        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));

        this.url.searchParams.set('_start','0');
        this.url.searchParams.set('_end','30');
        this.url.searchParams.set('_sort','createdAt');
        this.url.searchParams.set('_order','desc');
        this.url.searchParams.set('createdAt_gte',from.toISOString());
        this.url.searchParams.set('createdAt_lte',to.toISOString());

        const rangePicker = new RangePicker({
            from,
            to
        });
 
        const sortableTable = new SortableTable(
            header,
            {
                sorted : this.sorted,
                url :this.url,
            }
        );
        
        this.components.rangePicker = rangePicker;
        this.components.ordersContainer = sortableTable;
    }

    getTemplate(){

        return`
            <div class="sales full-height flex-column">
                <div class="content__top-panel">
                <h1 class="page-title">Продажи</h1>
                <div class="rangepicker" data-element = "rangePicker"> </div>
            </div>
            <div data-element = "ordersContainer" class = "full-height flex-column">
        `;
    }

    renderComponents(){
        
        Object.keys(this.components).forEach(componentName =>{

            const root = this.subElements[componentName];
            const {element} = this.components[componentName];
            root.append(element);
        });
    }

    render(){

        const element = document.createElement('div');
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;
        
        this.subElements = this.getSubElements();

        this.initComponents();
        this.renderComponents();
        
        this.element.addEventListener('date-select',this.onDateSelect);
        
        return this.element;
    }

    onDateSelect = (event) =>{
       
        this.updateComponents(event.detail.from,event.detail.to);
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

      remove(){

        if(this.element)
            this.element.remove();

      }

      destroy(){

        Object.keys(this.components).forEach(componentName =>{
            const element = this.components[componentName];
            element.destroy();
        });
        this.remove;
        this.subElements = {};
        this.components = {};
      }
}


