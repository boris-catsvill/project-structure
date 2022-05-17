import RangePicker from "../../components/range-picker";
import SortableTable from "../../components/sortable-table";
import fetchJson from "../../utils/fetch-json";
import header from "./orders-header";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    subElements = {};
    components = {};
    urlOrders = new URL('api/rest/orders', BACKEND_URL);

    render() {

        const element = document.createElement('div');
        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements();

        this.initComponents();
        this.renderComponents();
        this.initEventListeners();

        return this.element;

    }


    initComponents() {
        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth(), now.getDay()));

        const rangePicker = new RangePicker();

        const sortableTable = new SortableTable(header, {
            isSortLocally: false,
            url: `api/rest/orders?createdAt_gte=${from}&createdAt_lte=${to}&_sort=createdAt&_order=desc&_start=0&_end=30`
        })

        this.components = {
            rangePicker,
            sortableTable,
        }
    }

    renderComponents() {
        Object.keys(this.components).forEach(component => {
            const root = this.subElements[component];
            const { element } = this.components[component];
            root.append(element);
        });

        this.toggleProgressBar();
    }

    toggleProgressBar() {
        const element = document.querySelector('.progress-bar');
        return element.style.display === '' ? element.style.display = 'none' : element.style.display = 'none';

    }

    initEventListeners() {
        document.addEventListener('data-select', async event => {
            this.toggleProgressBar();
            const { from, to } = event.detail;

            const data = await this.loadData(from, to);
            this.components.sortableTable.update(data);
            this.toggleProgressBar();
        })
    }

    async loadData(from, to) {
        this.urlBestaSellers.searchParams.set('_start', '1');
        this.urlBestaSellers.searchParams.set('_end', '21');
        this.urlBestaSellers.searchParams.set('_sort', 'title');
        this.urlBestaSellers.searchParams.set('_order', 'asc');

        this.urlBestaSellers.searchParams.set('from', from.toISOString());
        this.urlBestaSellers.searchParams.set('to', to.toISOString());

        const data = await fetchJson(this.urlOrders);
        return data;
    }

    getSubElements() {
        const elements = this.element.querySelectorAll('[data-element');

        for (const item of elements) {
            this.subElements[item.dataset.element] = item
        }

        return this.subElements;
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = null;

        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }

    getTemplate() {
        return `<div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Sales</h1>
            <div data-element="rangePicker">
                <!-- range picker -->
            </div>
          </div>
          <div data-element="sortableTable">
          
          </div>
        </div>`
    }
}