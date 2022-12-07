import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';

import header from './sales-header.js';

export default class Page {
    element;
    subElements;

    range;
    sales;

    constructor() {
        this.monthRangeDefault = 1;
        this.range = {
            to: new Date(),
            from: new Date(),
        };
        this.range.from.setMonth(this.range.from.getMonth() - this.monthRangeDefault);
        const rangePicker = new RangePicker(this.range);

        this.sales = {
            url: `api/rest/orders?createdAt_gte=${rangePicker.selected.from.toISOString()}&createdAt_lte=${rangePicker.selected.to.toISOString()}`,
            isSortLocally: false,
            isDrilldown: false,
        };
        const sortableTable = new SortableTable(header, this.sales);

        this.components = {
            sortableTable,
            rangePicker
        };
    }

    async render() {
        const element = document.createElement("div");
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;

        this.subElements = this.getSubElements();

        Object.keys(this.components).forEach(componentName => {
            const subElement = this.subElements[componentName];
            const { element } = this.components[componentName];

            subElement.append(element);
        });

        this.initEventListener();

        return this.element;
    }

    getTemplate() {
        return `
        <div class="sales">
          <div class="content__top-panel">
            <h2 class="page-title">Sales</h2>
            <!-- RangePicker component -->
            <div data-element="rangePicker"></div>
          </div>

          <div data-element="sortableTable">
          <!-- sortable-table component -->
          </div>
        </div>
      `;
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

    initEventListener() {
        this.subElements.rangePicker.addEventListener('date-select', this.onDateSelect);
    }

    onDateSelect = async (event) => {
        this.components.sortableTable.url.searchParams.set('createdAt_gte', event.detail.from.toISOString());
        this.components.sortableTable.url.searchParams.set('createdAt_lte', event.detail.to.toISOString());
        await this.components.sortableTable.loadData(this.components.sortableTable.sorted.id, this.components.sortableTable.sorted.order);
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        for (const component of Object.values(this.components)) {
            component.destroy();
        }
        this.components = {};
        this.subElements = {};
    }
}