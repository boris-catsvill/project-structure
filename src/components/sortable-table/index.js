import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
    data = [];
    subElements = {};
    isLoading = false;

    constructor(header = [], {url = '', sortParams = {field: 'title', order: 'asc'}, step = 20} = {}) {
        this.header = header;
        this.url = new URL(url, BACKEND_URL);
        this.sortParams = sortParams;
        this.step = step;
        this.start = 0;
        this.end = this.start + this.step;
        this.isLocalSorting = false;

        this.render();
    }
    
    setUrl(field, order, start = this.start, end = this.end) {
        this.url.searchParams.set('_sort', field);
        this.url.searchParams.set('_order', order);
        this.url.searchParams.set('_start', start);
        this.url.searchParams.set('_end', end);
    }

    async getDataRequest(field, order, start = this.start, end = this.end) {
        this.element.classList.add('sortable-table_loading');
        this.subElements.body.innerHTML = '';
        
        this.url.searchParams.set('_sort', field);
        this.url.searchParams.set('_order', order);
        this.url.searchParams.set('_start', start);
        this.url.searchParams.set('_end', end);

        const data = await fetchJson(this.url);

        if (data) {
            this.element.classList.remove('sortable-table_loading');
            this.element.classList.remove("sortable-table_empty");

            return data;
        } else {
            this.element.classList.add("sortable-table_empty");
        }
    }

    async sortOnServer(field, order, start = this.start, end = this.end) {
        const data = await this.getDataRequest(field, order, start, end);

        this.subElements.body.innerHTML = this.getRows(data);
    }

    handleChangeSort = event => {
        const parent = event.target.closest('[data-sortable="true"]');
        const orders = {
            asc: 'desc',
            desc: 'asc'
        };

        if (parent) {
            const {id, order} = parent.dataset;
            const arrow = parent.querySelector(".sortable-table__sort-arrow");

            parent.dataset.order = orders[order];
            this.sortParams = {field: id, order};

            if (!arrow) {
                parent.append(this.subElements.arrow);
            }

            if (this.isLocalSorting) {
                const data = this.sort(id, orders[order]);
                this.subElements.body.innerHTML = this.getRows(data);
            } else {
                this.sortOnServer(id, orders[order]);
            }
        }
    }

    handleScroll = async () => {
        const scrollHeight = document.documentElement.clientHeight;
        const sizeElement = this.element.getBoundingClientRect();
        const isNeedLoad = sizeElement.bottom < scrollHeight && !this.isLoading;

        if (isNeedLoad) {
            const {start, end, sortParams} = this;
            const {field, order} = sortParams;

            this.isLoading = true;

            this.start = end;
            this.end = end + 20;

            const result = await this.getDataRequest(field, order, start, end);
            this.data = [...this.data, ...result];

            this.subElements.body.innerHTML = this.getRows(this.data);

            this.isLoading = false;
        }
    }

    getHeader(data) {
        return `
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${data.map(({id, title, sortable}) => {
                    const {field, order} = this.sortParams;
                    const isSorting = field === id;
                    const dataOrder = isSorting ? order : 'asc';

                    return `
                        <div class="sortable-table__cell" data-id=${id} data-sortable=${sortable} data-order=${dataOrder}>
                            <span>${title}</span>
                            ${isSorting ? this.getSortingArrow : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    get getSortingArrow() {
        return `<span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>`;
    };

    getBody(data) {
        return `
            <div data-element="body" class="sortable-table__body">
                ${this.getRows(data)}
            </div>
        `;
    }

    getRows = data => data.map(row => {
        return `
            <a href="/products/${row.id}" class="sortable-table__row">
                ${this.getCell(row)}
            </a>
        `;
    }).join('');

    getCell = row => this.header.map(({id, template}) => template
        ? template(row[id])
        : `<div class="sortable-table__cell">${row[id]}</div>`
    ).join('');

    compareString = (value1, value2, param) => {
        const compareString = (str1, str2) => str1.localeCompare(str2, ['ru', 'en'], {caseFirst: 'upper'});
    
        return param === 'desc' ? compareString(value2, value1)  : compareString(value1, value2); 
    }

    sort(field, orderValue) {
        const column = this.header.find(item => item.id === field);
        const {sortable, sortType} = column;
        const isDesc = orderValue === 'desc';

        if (!sortable) return;

        return [...this.data].sort((a, b) => {
            const value1 = a[field];
            const value2 = b[field];

            switch (sortType) {
                case 'string':
                    return this.compareString(value1, value2, orderValue);
                case 'number':
                    return isDesc ? value2 - value1 : value1 - value2;
                default:
                    return isDesc ? value2 - value1 : value1 - value2;
            }
        });
    }

    getSubElements = (element) => {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;

          return accum;
        }, {});
    }

    async render() {
        const element = document.createElement('div');

        element.innerHTML = `
            <div data-element="productsContainer" class="products-list__container">
                <div class="sortable-table">
                    ${this.getHeader(this.header)}
                    ${this.getBody(this.data)}
                    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                        <div>
                            <p>No products satisfies your filter criteria</p>
                            <button type="button" class="button-primary-outline">Reset all filters</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        this.element = element.firstElementChild;
        this.element = element;
        this.subElements = this.getSubElements(element);
        
        const data = await this.getDataRequest();
        this.initEventListeners();

        this.subElements.body.innerHTML = this.getRows(data);
    }

    initEventListeners() {
        this.subElements.header.addEventListener('pointerdown', this.handleChangeSort);
        document.addEventListener('scroll', this.handleScroll);
    }

    remove() {
        this.element.remove();
        document.removeEventListener("scroll", this.handleScroll);
    }
    
    destroy() {
        this.remove();
        this.subElements = {};
    }
}
