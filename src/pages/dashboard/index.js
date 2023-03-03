import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

    element = null;
    subElements = {};
    components = {};
    url = new URL('api/dashboard/bestsellers',BACKEND_URL);

    async loadData(from,to){

        this.url.searchParams.set('_start','1');
        this.url.searchParams.set('_end','21');
        this.url.searchParams.set('_sort','title');
        this.url.searchParams.set('_order','asc');
        this.url.searchParams.set('from',from.toISOString());
        this.url.searchParams.set('to',to.toISOString());

        const data = await fetchJson(this.url);
      
        return data;
    }

    async updateComponents(from,to){

        const data = await this.loadData(from,to);
        
        this.components.sortableTable.subElements.body.innerHTML = '';
        this.components.sortableTable.table =[];
        this.components.sortableTable.update(data);

        this.components.ordersChart.update(from,to);
        this.components.customersChart.update(from,to);
        this.components.salesChart.update(from,to);
    }

    initComponents(){

        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));

        this.url.searchParams.set('from',from.toISOString());
        this.url.searchParams.set('to',to.toISOString());

        const rangePicker = new RangePicker({
            from,
            to
        });

        const ordersChart = new ColumnChart({
            url: 'api/dashboard/orders',
            range: {
              from,
              to
            },
            label: 'orders',
            link: '/sales'
          });

        const salesChart = new ColumnChart({
        url: 'api/dashboard/sales',
        range: {
          from,
          to
        },
        label: 'sales',
        formatHeading: data => `$${data}`
        });

        const customersChart = new ColumnChart({
            url: 'api/dashboard/customers',
            range: {
            from,
            to
            },
            label: 'customers',
        });

        const sortableTable = new SortableTable(
            header,
            {
                url :this.url,
                isSortLocally: true
            }
        );
        
        this.components.rangePicker = rangePicker;
        this.components.ordersChart = ordersChart;
        this.components.salesChart = salesChart;
        this.components.customersChart = customersChart;
        this.components.sortableTable = sortableTable;
    }

    getTemplate(){

        return`
            <div class="dashboard">
                <div class="content__top-panel">
                    <h2 class="page-title">Dashboard</h2>
                    <!-- RangePicker component -->
                     <div data-element="rangePicker"></div>
                </div>
                <div data-element="chartsRoot" class="dashboard__charts">
                    <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                    <div data-element="salesChart" class="dashboard__chart_sales"></div>
                    <div data-element="customersChart" class="dashboard__chart_customers"></div>
                </div>
                <h3 class="block-title">Best sellers</h3>
                <div data-element="sortableTable"></div>
            </div>
        `;
    }

    renderComponents(){
        
        Object.keys(this.components).forEach(componentName =>{

            const root = this.subElements[componentName];
            const {element} = this.components[componentName];
            root.append(element);
        })
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
