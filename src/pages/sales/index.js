import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import fetchJson from '../dashboard/utils/fetch-json.js';
import select from '../../utils/select.js';

import header from './header.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
    element;
    subElements = {};
    components = {};

    url = new URL('api/rest/orders', BACKEND_URL);
    
    getTeamplate () {
        return `
            <div class="sales full-height flex-column">
                <div class="content__top-panel">
                    <h1 class="page-title">Sales</h2>
                    <div data-element="rangePicker"></div>
                </div>

                <div data-element="sortableTable" class="full-height flex-column"></div>
            </div>
        `
    }

    createUrl (from, to) {
        this.url.searchParams.set('createdAt_gte', from.toISOString());
        this.url.searchParams.set('createdAt_lte', to.toISOString());
        this.url.searchParams.set('_end', '30');
        this.url.searchParams.set('_start', '0');
        this.url.searchParams.set('_sort', this.components.sortableTable.sorted.id);
        this.url.searchParams.set('_order', this.components.sortableTable.sorted.order);
        
        return this.url
    }

    async updateComponents (from, to) {
      const data = await fetchJson(this.createUrl(from, to));
  
      this.components.sortableTable.updateClear(data);
    }

    initEventListeners () {
      this.components.rangePicker.element.addEventListener('date-select', (event) => {
        const { from, to } = event.detail;
    
        this.updateComponents(from, to)
      });

      this.components.sortableTable.url = this.url;
    }

    initCompinents () {
        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));
        this.url.searchParams.set('createdAt_gte', from.toISOString());
        this.url.searchParams.set('createdAt_lte', to.toISOString());
    
        const sortableTable = new SortableTable(header, 
            {url: this.url, 
            sorted: {id: 'createdAt', order: 'desc'},
        });

        const rangePicker = new RangePicker({
            from,
            to
        });

        this.components = {
            rangePicker,
            sortableTable
        };

        this.components.sortableTable.subElements.emptyPlaceholder.innerHTML = 
        `<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No orders
        </div>`
    }

    renderComponents () {
        for (const key of Object.keys(this.components)) {
          this.subElements[key].append(this.components[key].element)
        }
    }

    render () {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTeamplate();
    
        const element = wrapper.firstElementChild;
        this.element = element;
    
        this.subElements = this.getSubElements();
        select();

        this.initCompinents();
        this.renderComponents();
        this.initEventListeners();
    
        return this.element;
      }

      getSubElements () {
        const result = {};
        const elements = this.element.querySelectorAll('[data-element]');
    
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
    
      destroy () {
        this.remove();
        this.subElements = {};
        this.element = null;
    
        for (const component of Object.values(this.components)) {
          component.destroy();
        }
    
        this.components = {};
      }
}