import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    element;
    subElements = {};
    components = {};
 
    render() {
       const element = document.createElement('div');
       element.innerHTML = this.template();
 
       this.element = element.firstElementChild;
       this.subElements = this.getSubElements(this.element);
 
       this.initComponents();
       this.renderComponents();
 
       this.initEnentListeners();
 
       return this.element;
    }
 
    template() {
        return `
            <div class="dashboard">
                <div class="content__top-panel">
                    <h2 class="page-title">Dashboard</h2>
                    <div data-element="rangePicker">
                    </div>
                </div>
                <div class="dashboard__charts">
                    <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                    <div data-element="salesChart" class="dashboard__chart_sales"></div>
                    <div data-element="customersChart" class="dashboard__chart_customers"></div>
                </div>
                <h3 class="block-title">Best sellers</h3>
                <div data-element="sortableTable">
                </div>
            </div>
        `;
    }
 
    initComponents() {
        const to = new Date();
        const from = new Date(to.getTime() - 7 * 24 * 3600 * 1000);
    
        const rangePicker = new RangePicker({from, to});
 
        const ordersChart = new ColumnChart({
            url: 'api/dashboard/orders',
            range: {from, to},
            label: 'orders',
            link: '#'
        });
 
        const salesChart = new ColumnChart({
            url: 'api/dashboard/sales',
            range: {from, to},
            label: 'sales'
        });
    
        const customersChart = new ColumnChart({
            url: 'api/dashboard/customers',
            range: {from, to},
            label: 'customers'
        });
    
        const sortableTable = new SortableTable(header, {
            url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}&_sort=title&_order=asc&_start=0&_end=30`,
            isSortLocally: true
        });
    
        this.components.rangePicker = rangePicker;
        this.components.ordersChart = ordersChart;
        this.components.salesChart = salesChart;
        this.components.customersChart = customersChart;
        this.components.sortableTable = sortableTable;
    }
 
    renderComponents() {
        for (const component of Object.keys(this.components)) {
            const subElement = this.subElements[component];
            const { element } = this.components[component];
    
            subElement.append(element);
        }
    }
 
    initEnentListeners() {
        const rangePicker = this.components.rangePicker.element;
    
        rangePicker.addEventListener('date-select', (event) => {
            const { from, to } = event.detail;
            this.updateComponents(from, to);
        });
    }
 
    async updateComponents(from, to) {
        const url = new URL('api/dashboard/bestsellers', BACKEND_URL);
        url.searchParams.set('from', from.toISOString());
        url.searchParams.set('to', to.toISOString());
        url.searchParams.set('_sort', 'title');
        url.searchParams.set('_order', 'asc');
        url.searchParams.set('_start', '0');
        url.searchParams.set('_end', '30');
    
        const data = await fetchJson(url);
    
        this.components.sortableTable.addRows(data);
        this.components.sortableTable.update(data);
        this.components.ordersChart.update(from, to);
        this.components.salesChart.update(from, to);
        this.components.customersChart.update(from, to);
    }
 
    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
    
            return accum;
        }, {});
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
