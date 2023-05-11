import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {

    element;
    subElements = {};
    url = new URL('/api/rest', BACKEND_URL);
    components = [];
       
    async render() {   
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getHTML();
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();

        this.renderComponents();
        this.element.addEventListener("date-select", this.rangeSelected);
                    
        return this.element;
    }

    getHTML() {
        return `<div class="sales full-height flex-column">
        <div class="content__top-panel">
            <h1 class="page-title">Sales</h1>
            <!-- RangePicker component -->
            <div data-element="rangePicker"></div>
        </div>
        <div data-element="sortableTable" class="full-height flex-column">
            <!-- sortable-table component -->
        </div>
        </div>`;
    }

    renderComponents() {        
        const to = new Date();
        const from = new Date();
        from.setMonth(from.getMonth() - 1);
        
        this.addRangePicker(from, to);
        this.addSortableTable(from, to);
    }  

    addRangePicker(from, to) {
        const top = this.element.querySelector(".content__top-panel");
        const rangePicker = new RangePicker({from, to});
        rangePicker.render();
        top.append(rangePicker.element);
    }

    addSortableTable(from, to) {
        const newTable = new SortableTable(header, {
        url: `${this.url}/orders`,
        isSortLocally: true,
        sorted: {
            id: "createdAt",
            order: "desc"},
        range: {
            'createdAt_gte': from,
            'createdAt_lte': to
        }
        });

        this.subElements.sortableTable.append(newTable.element);
        this.components.push(newTable);
    }

    rangeSelected = async (event) => {
        const {from, to} = event.detail;
        const promises = [...this.components.map((component) => component.update(from, to))];
        await Promise.all(promises);
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