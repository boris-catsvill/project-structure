import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
    header = [
        {
          id: 'id',
          title: 'ID',
          sortable: true,
          sortType: 'number'
        },
        {
          id: 'user',
          title: 'Клиент',
          sortable: true,
          sortType: 'string'
        },
        {
          id: 'createdAt',
          title: 'Дата',
          sortable: true,
            sortType: 'custom',
            template: item => {
                const date = new Date(item).toLocaleString('ru', { day: 'numeric', month: 'short', year: 'numeric' });
                return `<div class="sortable-table__cell">${date}</div>`;
            }
        },
        {
          id: 'totalCost',
          title: 'Стоимость',
          sortable: true,
          sortType: 'number',
          template: item => {
            return `<div class="sortable-table__cell">$${item}</div>`;
          }
        },
        {
          id: 'delivery',
          title: 'Статус',
          sortable: true,
          sortType: 'string'
        }
    ];
    
    constructor({
        url = `/api/rest/orders`,
        sort = 'createdAt',
        order = 'desc',
        start = 0,
        end = 30,
        dates = {
            from: new Date((new Date).setMonth((new Date).getMonth() - 1)),
            to: new Date()
        }
    
    } = {}) {
        this.url = new URL(url, BACKEND_URL);
        this.sort = sort;
        this.order = order;
        this.start = start;
        this.end = end;
        this.dates = dates;
    }

     render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();

        const rangePicker = new RangePicker({
            from: this.dates.from,
            to: this.dates.to
        });

        wrapper.querySelector('.content__top-panel').append(rangePicker.element);
        
        this.element = wrapper.firstElementChild;
        wrapper.remove();

        this.loadTable(this.dates.from, this.dates.to);
        
        this.initEventListeners();
         
        return this.element;
    }

    getTemplate() {
        return `
            <div class="sales full-height flex-column">
                <div class="content__top-panel">
                    <h1 class="page-title">Продажи</h1>
                </div>
                <div data-elem="ordersContainer" class="full-height flex-column"></div>
            </div>
        `;
    }

    loadTable(from, to) {
        this.url.searchParams.set('createdAt_gte', from.toISOString());
        this.url.searchParams.set('createdAt_lte', to.toISOString());

        this.sortableTable = new SortableTable(this.header, {
            url: this.url,
            sorted: {
                id: 'createdAt',
                order: 'desc'
            },
            step: 30,
            start: 0
        });

        this.element.querySelector('[data-elem="ordersContainer"]').append(this.sortableTable.element);
    }

    initEventListeners() {
        this.element.addEventListener('date-select', async (evt) => {
            this.dates.from = evt.detail.from;
            this.dates.to = evt.detail.to;

            this.updateTable();
        });
    }

    updateTable() {
            this.sortableTable.url.searchParams.set('createdAt_gte', this.dates.from.toISOString());
            this.sortableTable.url.searchParams.set('createdAt_lte', this.dates.to.toISOString());
            this.sortableTable.updateData(this.sortableTable.url);
    }

    destroy() {
        this.remove();
    }

    remove() {
        this.element.remove();
    }
}
