import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = `${process.env.BACKEND_URL}`; 

export default class Page {
    element;
    subElements = {};
    components = {};

    async updateComponents(from, to) {
     new URL(url, BACKEND_URL);
        const data = await fetchJson( new URL(`api/dashboard/bestsellers`, BACKEND_URL) )  //(`${BACKEND_URL}/api/dashboard/bestsellers`
        this.components.SortableTable.addRows(data);
        this.components.ordersChart.update(from,to);
        this.components.salesChart.update(from,to);
        this.components.customsChart.update(from,to);
    }

   initComponents() {
        let now = new Date(); 
        let to = new Date(); 
        const from = new Date( now.setMonth( now.getMonth() - 1 ) );
        const rangePicker = new RangePicker( {from, to } );

        const sortableTable = new SortableTable(header, {
            url: `api/dashboard/bestsellers`,  
            isSortlocaly: true
        });

        const ordersChart = new ColumnChart( {
            url: `api/dashboard/orders`,
            range: { from, to },
            label: 'orders'
        });
        const salesChart = new ColumnChart( {
            url: `api/dashboard/sales`,
            range: { from, to },
            label: 'orders'
        });

       const customersChart = new ColumnChart( {
            url: `api/dashboard/customers`,
            range: { from, to },
            label: 'orders'
        });

        this.components = {
            rangePicker,
            sortableTable,
            ordersChart,
            salesChart,
            customersChart
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
        return ` <div class="dashboard">
                   <div class="content__top-panel">
                     <h2 class="page_title">Dashboard</h2>
                     <!---  -->
                     <div data-element="rangePicker"></div>
                   </div>
                   <div data-element="ChartsRoot" class="dashboard__charts">
                   <!---  -->
                      <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                      <div data-element="salesChart" class="dashboard__chart_sales"></div>
                      <div data-element="customersChart" class="dashboard__chart_customers"></div>
                   </div>
                   <h3 class="block-title" >Best sales</h3>
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
