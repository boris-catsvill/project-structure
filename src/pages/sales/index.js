import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header';

export default class SalesPage {
    constructor() {
    }

    async render() {
        this.element = this.getTemplate()
        this.subElements = this.getSubElements(this.element)
        this.initialize()
        return this.element
    }

    initialize() {
        const { from, to } = this.getRange();
        const sortableTable = this.getSortableTable(from, to)
        const rangePicker = this.getRangePicker(from, to)


        this.components = { rangePicker, sortableTable } //
        this.renderComponents()

    }

    renderComponents() {
        Object.keys(this.components).forEach(component => {
            const root = this.subElements[component]
            const element = this.components[component].element
            root.append(element)
        })

    }

    getRangePicker(from, to) {
        const rangePicker = new RangePicker({
            from: from,
            to: to
        })

        rangePicker.element.addEventListener('date-select', event => {
            this.range = event.detail
            this.update()
        });

        return rangePicker
    }

    update() {
        if (!this.range) return
        const {from, to} = this.range
  
        Object.keys(this.components).forEach(component => {
            component != 'rangePicker' ? this.components[component].update(from, to) : ''
        })
    }

    getSortableTable(from, to) {
        const sortableTable = new SortableTable(header,
            {
                sorted: {
                    id: "createdAt",
                    order: 'desc'
                },
                url: 'api/rest/orders',
                from: from,
                to: to,
                paramFrom: 'createdAt_gte',
                paramTo: 'createdAt_lte'
            });
        return sortableTable
    }

    getTemplate() {
        return this.createElement(`<div class="sales full-height flex-column">
        <div class="content__top-panel">
            <h1 class="page-title">Продажи</h1>
            <div class="rangepicker" data-element="rangePicker">
                <!-- range picker cimponent -->
            </div>
        </div>
        <div data-elem="ordersContainer" class="full-height flex-column" data-element="sortableTable">
            <!-- sortable table-->
        </div>
    </div>`)
    }

    getSubElements(element) {
        const result = {};
        const elements = element.querySelectorAll('[data-element]');

        for (const subElement of elements) {
            const name = subElement.dataset.element;
            result[name] = subElement;
        }
        return result;
    }

    createElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
    }

    getRange() {
        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));

        return { from, to };
    }

    

}