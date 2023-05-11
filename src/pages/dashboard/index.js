import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {

    element;
    subElements = {};
    url = new URL('/api/dashboard', BACKEND_URL);
    components = [];
    progressBar;
       
    async render() {   
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getHTML();
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();

        this.renderComponents();
        this.element.addEventListener("date-select", this.rangeSelected);

        this.progressBar = document.getElementsByClassName("progress-bar")[0];
        if (this.progressBar) {
            this.progressBar.style.display = "none";
        }
                    
        return this.element;
    }

    getHTML() {
        return `<div class="dashboard">
        <div class="content__top-panel">
            <h1 class="page-title">Dashboard</h1>
            <!-- RangePicker component -->
            <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
            <!-- column-chart components -->
            <div data-element="ordersChart" class="column-chart dashboard__chart_orders"></div>
            <div data-element="salesChart" class="column-chart dashboard__chart_sales"></div>
            <div data-element="customersChart" class="column-chart dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable">
            <!-- sortable-table component -->
        </div>
        </div>`;
    }

    renderComponents() {        
        const to = new Date();
        const from = new Date();
        from.setMonth(from.getMonth() - 1);
        from.setDate(from.getDate() + 1);
        
        this.addRangePicker(from, to);
        this.addColumnChart("orders", from, to, 'sales');
        this.addColumnChart("sales", from, to, '', (data) => `$${data.toLocaleString('en')}`);
        this.addColumnChart("customers", from, to);
        this.addSortableTable(from, to);
    }  

    addRangePicker(from, to) {
        const top = this.element.querySelector(".content__top-panel");
        const rangePicker = new RangePicker({from, to});
        rangePicker.render();
        top.append(rangePicker.element);
    }

    addColumnChart(label, from, to, link = '', formatHeading = data => data){
        const newChart = new ColumnChart({
            label: label,
            link: link,
            formatHeading: formatHeading,
            url: `${this.url}/${label}`,
            range: {
              from,
              to,
            },
          });

        this.subElements[`${label}Chart`].append(newChart.element);
        this.components.push(newChart);
    }

    addSortableTable(from, to) {
        const newTable = new SortableTable(header, {
        url: `${this.url}/bestsellers`,
        isSortLocally: true,
        range: {
            'from': from,
            'to': to
        },
        hrefPath: '/products/' 
        });

        this.subElements.sortableTable.append(newTable.element);
        this.components.push(newTable);
    }

    rangeSelected = async (event) => {
        const {from, to} = event.detail;
        const promises = [...this.components.map((component) => component.update(from, to))];
        this.progressBar.style.display = "block";
        await Promise.all(promises);
        this.progressBar.style.display = "none";
    };
  
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
