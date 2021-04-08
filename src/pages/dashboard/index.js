import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
    dates = {
        from: new Date((new Date).setMonth((new Date).getMonth() - 1)),
        to: new Date()
    }

    async render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'dashboard full-height flex-column';
        wrapper.innerHTML = this.getTemplate();

        this.getElements();

        wrapper.querySelector('.content__top-panel').append(this.rangePicker.element);
        wrapper.querySelector('.dashboard__charts').append(this.chartOrders.element);
        wrapper.querySelector('.dashboard__charts').append(this.chartSales.element);
        wrapper.querySelector('.dashboard__charts').append(this.chartCustomers.element);
        wrapper.append(this.sortableTable.element);

        this.element = wrapper;

        this.subElements = {
            rangePicker: this.rangePicker.element,
            sortableTable: this.sortableTable.element,
            ordersChart: this.chartOrders.element,
            customersChart: this.chartCustomers.element,
            salesChart: this.chartSales.element 
        }

        wrapper.remove();

        this.initEventListeners();

        return this.element;
    }

    getTemplate() {
        return `
            <div class="content__top-panel">
                <h2 class="page-title">Панель управления</h2>
            </div>
            <div class="dashboard__charts">
            </div>
            <h3 class="block-title">Лидеры продаж</h3>
        `;
    }

    getElements() {
        this.rangePicker = new RangePicker({
            from: this.dates.from,
            to: this.dates.to
        });
        
        this.sortableTable = new SortableTable(header, {
            url: `api/dashboard/bestsellers?from=${this.dates.from.toISOString()}&to=${this.dates.to.toISOString()}`,
            sorted: {
                id: 'title',
                order: 'desc'
            },
            step: 30,
            start: 0,
            isSortLocally: true
        });

        this.chartOrders = new ColumnChart({
            url: 'api/dashboard/orders',
            range: {
                from: this.dates.from,
                to: this.dates.to,
            },
            label: 'orders',
            link: '#'
        });

        this.chartSales = new ColumnChart({
            url: 'api/dashboard/sales',
            range: {
              from: this.dates.from,
              to: this.dates.to,
            },
            label: 'sales',
            formatHeading: data => `$${data}`
          });

        this.chartCustomers = new ColumnChart({
            url: 'api/dashboard/customers',
            range: {
              from: this.dates.from,
              to: this.dates.to,
            },
            label: 'customers',
          });
    }

    initEventListeners() {
        this.element.addEventListener('date-select', async (evt) => {
            this.dates.from = evt.detail.from;
            this.dates.to = evt.detail.to;

            await this.chartOrders.update(this.dates.from, this.dates.to);
            await this.chartCustomers.update(this.dates.from, this.dates.to);
            await this.chartSales.update(this.dates.from, this.dates.to);

            this.sortableTable.url.searchParams.set('from', this.dates.from.toISOString());
            this.sortableTable.url.searchParams.set('to', this.dates.to.toISOString());

            const data = await this.sortableTable.loadData(this.sortableTable.sorted.id, this.sortableTable.sorted.order);
            this.sortableTable.addRows(data);
        });
    }

    destroy() {
        this.remove();
    }

    remove() {
        this.element.remove();
    }
}
