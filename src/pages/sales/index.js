import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
    element;
    subElements = {};
    components = {};

    constructor() {
        this.to = new Date();
        this.from = new Date(this.to.getTime() - (30 * 24 * 60 * 60 * 1000));
    }

    get template() {
        return `
            <div class="sales full-height flex-column">
                <div class="content__top-panel">
                    <h1 class="page-title">Продажи</h1>
                    <!-- RangePicker component -->
                    <div data-element="rangePicker"></div>
                </div>
                <div data-element="sortableTable" class="full-height flex-column">
                <!-- sortable-table component -->
                </div>
            </div>
        `;
    }
    
    initSortableTable({
        from = this.from,
        to = this.to
    } = {}) {
        const url = new URL("api/rest/orders", process.env.BACKEND_URL);
        url.searchParams.append("createdAt_gte", from.toISOString());
        url.searchParams.append("createdAt_lte", to.toISOString());
        url.searchParams.append("_start", "0");
        url.searchParams.append("_end", "30");
        const sortableTable = new SortableTable(header, {
            url: url.href
        });
        this.components.sortableTable = sortableTable;
    }

    initComponents () {
        const rangePicker = new RangePicker({
            from: this.from,
            to: this.to
        });

        this.components.rangePicker = rangePicker;
    }

    async renderComponents() {
        const {rangePicker, sortableTable} = this.components;

        this.subElements.rangePicker.append(rangePicker.element);
        this.subElements.sortableTable.append(sortableTable.element);
    }

    async updateTableComponent ({
        from,
        to
    } = {}) {
        this.initSortableTable(arguments[0]);
        this.subElements.sortableTable.firstElementChild.replaceWith(this.components.sortableTable.element);
    }

    initEventListeners () {
        this.components.rangePicker.element.addEventListener("date-select", event => {
            const { from, to } = event.detail;
            this.updateTableComponent({from, to});
        });
    }

    async render () {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initComponents();
        this.initSortableTable();

        await this.renderComponents();
        this.initEventListeners();

        return this.element;
    }

    getSubElements (element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }

    destroy () {
        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }
}