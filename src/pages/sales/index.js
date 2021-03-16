import RangePicker from '../../components/range-picker/index.js';
import SortableTable from "../../components/sortable-table/index.js";
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';


export default class Page {
    element;
    subElements = {};
    components = {};

    get template() {
      return `
    <div class="sales">
      <div class="content__top-panel">
        <h2 class="page-title">Sales</h2>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="sortableTable"></div>
    </div>
  `;
    }

    async render() {
      const element = document.createElement('div');
      element.innerHTML = this.template;
      this.element = element.firstElementChild;
      this.subElements = this.getSubElements(this.element);
    
      await this.initComponents(); 
      this.renderComponents();
      this.initEventListeners();  
      return this.element;
    }

    getSubElements(element) {
      const elements = element.querySelectorAll('[data-element]');

      return [...elements].reduce((accum, subElement) => {
        accum[subElement.dataset.element] = subElement;
        return accum;
      }, {});
    }

    initComponents() {
      const to = new Date();
      const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));
    
      const rangePicker = new RangePicker({
        from,
        to
      });

      const sortableTable = new SortableTable(header, {
        url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
        isSortLocally: true
      }); 


      this.components = {rangePicker, sortableTable};
    }


    renderComponents() {
      Object.keys(this.components).forEach(component => {
        const root = this.subElements[component];
        const { element } = this.components[component];
    
        root.append(element);
      });
    }

    initEventListeners() {
      this.components.rangePicker.element.addEventListener('date-select', event => {
        const {from, to} = event.detail;        
        this.updateComponents(from, to);
      });
    }
    async updateComponents(from, to) {
      const data = await fetchJson(`${BACKEND_URL}api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`);
      this.components.sortableTable.addRows(data);
      this.components.sortableTable.update(data);
    }
    remove() {
      this.element.remove();
    }

    destroy () {
      for (const component of Object.values(this.components)) {
        component.destroy();
      }
    }
}