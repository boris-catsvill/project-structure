import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';

class LinkSortableTable extends SortableTable {
    getTableRows(data) {
        return data.map(item => `
            <a href="${`/products/${item.id}`}" class="sortable-table__row">
                ${this.getTableRow(item, data)}
            </a>`
        ).join('');
    }
}

export default class Page {
    element;
    subElements = {};
    components = {};
    searchParams = {};

    get template() {
        return `
            <div class="products-list">
                <div class="content__top-panel">
                    <h1 class="page-title">Товары</h1>
                    <a href="/products/add" class="button-primary">Добавить товар</a>
                </div>
                <div class="content-box content-box_small">
                    <form class="form-inline">
                        <div class="form-group">
                            <label class="form-label">Сортировать по:</label>
                            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
                        </div>
                        <div class="form-group" data-elem="sliderContainer">
                            <label class="form-label">Цена:</label>
                            <!-- DoubleSlider component -->
                            <div data-element="doubleSlider"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Статус:</label>
                            <select class="form-control" data-element="filterStatus">
                                <option value="" selected="">Любой</option>
                                <option value="1">Активный</option>
                                <option value="0">Неактивный</option>
                            </select>
                        </div>
                    </form>            
                </div>
                <div data-elem="productsContainer" class="products-list__container">
                    <div data-element="sortableTable">
                        <!-- sortable-table component -->
                    </div>
                </div>
            </div>
        `;
    }

    async render() {
        const element = document.createElement("div");

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initComponents();
        this.initSortableTable();

        await this.renderComponents();
        this.initEventListeners();

        return this.element;
    }

    initSortableTable({
        priceFrom,
        priceTo,
        titleLike,
        status
    } = {}) {
        const url = new URL("api/rest/products", process.env.BACKEND_URL);
        url.searchParams.append("_embed", "subcategory.category");
        url.searchParams.append("_sort", "title");
        url.searchParams.append("_order", "asc");
        url.searchParams.append("_start", "0");
        url.searchParams.append("_end", "30");
        if (priceFrom != undefined) {
            url.searchParams.append("price_gte", priceFrom);
        }
        if (priceTo != undefined) {
            url.searchParams.append("price_lte", priceTo);
        }
        if (titleLike) {
            url.searchParams.append("title_like", titleLike);
        }
        if (status) {
            url.searchParams.append("status", status);
        }
        const sortableTable = new LinkSortableTable(header, {
            url: url.href
        });
        this.components.sortableTable = sortableTable;
    }

    initComponents() {
        const doubleSlider = new DoubleSlider({
            min: 0,
            max: 4000,
            formatValue: value => '$' + value
        });
        this.components.doubleSlider = doubleSlider;
    }

    async renderComponents() {
        const {doubleSlider, sortableTable} = this.components;

        this.subElements.doubleSlider.append(doubleSlider.element);
        this.subElements.sortableTable.append(sortableTable.element);
    }

    async updateTableComponent ({
        priceFrom,
        priceTo,
        titleLike,
        status
    } = {}) {
        this.initSortableTable(arguments[0]);
        this.subElements.sortableTable.firstElementChild.replaceWith(this.components.sortableTable.element);
    }

    initEventListeners () {
        this.subElements.filterName.addEventListener("input", event => {
            this.searchParams.titleLike = event.target.value;
            this.updateTableComponent(this.searchParams);
        });
        this.components.doubleSlider.element.addEventListener("range-select", event => {
            const { from, to } = event.detail;
            this.searchParams.priceFrom = from;
            this.searchParams.priceTo = to;
            this.updateTableComponent(this.searchParams);
        });
        this.subElements.filterStatus.addEventListener("change", event => {
            this.searchParams.status = event.target.value;
            this.updateTableComponent(this.searchParams);
        });
    }
        
    getSubElements (element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;
    
          return accum;
        }, {});
    }
    
    destroy() {
        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }
}
