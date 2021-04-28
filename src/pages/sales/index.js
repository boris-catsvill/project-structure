import SortableTable from '../../components/sortable-table/index.js';
import RangePicker from '../../components/range-picker/index.js';
import header from './sales-header.js';

const BACKEND_URL = process.env.BACKEND_URL;

import fetchJson from '../../utils/fetch-json.js';

export default class SalesPage {
    subElements = {};
    components = {};

    get getTemplate() {
        return `
            <div class="sales">
              <div class="content__top-panel">
                <h2 class="page-title">Продажи</h2>
                <div data-element="rangePicker"></div>
              </div>
              <div data-element="sortableTable"></div>
            </div>
        `;
    }

    async render() {
        const element = document.createElement('div');
        element.innerHTML = this.getTemplate;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        await this.initComponents();

        const subElementsFields = Object.keys(this.subElements);

        for (const index in subElementsFields) {
            const elementField = subElementsFields[index];

            this.subElements[elementField].append(this.components[elementField].element);
        }

        this.initEventListeners();

        return this.element;
    }

    async initComponents() {
        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));

        const rangePicker = new RangePicker({
            from,
            to
        });

        const sortableTable = new SortableTable(header, {
            url: `api/rest/orders?createdAt_gte=${from}&createdAt_lte=${to}`,
            sorted: {
                id: 'createdAt',
                order: 'desc'
            }
        });

        this.components = {
            rangePicker,
            sortableTable
        };
    }

    async updateComponents(from, to) {
        const { sortableTable } = this.components;
        const data = await fetchJson(`${BACKEND_URL}api/rest/orders?createdAt_gte=${from}&createdAt_lte=${to}&_sort=createdAt&_order=desc&_start=0&_end=30`);

        sortableTable.addRows(data);
    }

    initEventListeners() {
        const { rangePicker } = this.components;
        const onUpdatePage = (event) => {
            const { from, to } = event.detail;
            this.updateComponents(from, to);
        }

        rangePicker.element.addEventListener('date-select', onUpdatePage);
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