import SortableTable from '../../components/sortable-table/index.js';
import RangePicker from '../../components/range-picker/index.js';
import SalesHeader from './sales-header.js';

export default class Sales {

    constructor() {
        this.components = {};
        this.initComponents();
    }

    initComponents() {
        const to = new Date();
        const from = new Date(to.getFullYear(), to.getMonth() -1);

        this.components.rangePicker = new RangePicker({from, to});

        this.components.sortableTable = new SortableTable(SalesHeader, {
            url: this.getTableUrl(from, to),
            sorted: {
                id: 'createdAt',
                order: 'desc',
            },
            start: 0,
            step: 30,
        })
    }

    getTableUrl(from, to) {
        return `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`;
    }

    updateTable(from, to) {
        const { sorted, step } = this.components.sortableTable;
        this.components.sortableTable.url = new URL(this.getTableUrl(from, to), process.env.BACKEND_URL);
        this.components.sortableTable.sortOnServer(sorted.id, sorted.order, 0, step);
    }

    getTemplate() {
        return `<div class="sales full-height flex-column">
                    <div class="content__top-panel">
                        <h1 class="page-title">Продажи</h1>
                        <div data-element="rangePicker">
                        </div>
                    </div>
                    <div data-element="sortableTable">
                    </div>
                </div>`
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.getSubElements(wrapper);
        for (const key in this.components) {
            this.subElements[key].append(this.components[key].element);
        }
        this.element = wrapper.firstElementChild;
        this.initEventListeners();
        return this.element;
    }

    initEventListeners() {
        this.components.rangePicker.element.addEventListener('date-select', event => {
            const { from, to } = event.detail;
            this.updateTable(from, to);
        });
    }

    // ------------------------- Utils methods -------------------------
    getSubElements(element) {
        const dataElements = element.querySelectorAll('[data-element]');
        this.subElements = [...dataElements].reduce((accum, element) => {
            accum[element.dataset.element] = element;

            return accum;
        }, {})
    }
}