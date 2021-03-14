import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './productList-header.js';

import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
    element;
    subElements;
    components = {};
    fromPrice = 0;
    toPrice = 4000;

    get template() {
        return `<div class="products-list">
            <div class="content__top-panel">
                <h1 class="page-title">Products</h1>
                <a class="button-primary" href="/products/add">Add product</a>
            </div>

            ${this.formSearchProduct()}

            <div class="products-list__container">
              <div class="sortable-table" data-element="productsContainer"></div>
            </div>
            </div>
        </div>`;
    }

    formSearchProduct() {
        return `<div class="content-box content-box_small">
            <form class="form-inline">
                <div class="form-group">
                    <label class="form-label">Сортировать по:</label>
                    <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
                </div>
                <div class="form-group" data-element="sliderContainer">
                    <label class="form-label">Цена:</label>
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
        </div>`;
    }

    doubleSlider() {
        this.components.slider = new DoubleSlider(
            {min: this.fromPrice,
            max: this.toPrice,}
        );
        return this.components.slider.element;
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.updateComponent();
        this.initEventListeners();

        return this.element;
    }

    updateComponent() {
        this.subElements.sliderContainer.append(this.doubleSlider());

        this.subElements.productsContainer.innerHTML = '';
        this.subElements.productsContainer.append(this.sortableTable());
    }


    initEventListeners() {
        this.components.slider.element.addEventListener('range-select', async event => {
          const { from, to } = event.detail;

          this.fromPrice = from;
          this.toPrice = to;

          const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category&price_gte=${this.fromPrice}&price_lte=${this.toPrice}&_sort=title&_order=asc&_start=0&_end=30`);
          this.components.sortableTable.renderRows(data);
        });

        this.subElements.filterName.addEventListener('input', async event => {
            if (this.subElements.filterName.value.trim() !== '') {
                const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category&price_gte=${this.fromPrice}&price_lte=${this.toPrice}&title_like=${this.subElements.filterName.value.trim()}&_sort=title&_order=asc&_start=0&_end=30`);
                this.components.sortableTable.renderRows(data);
            }
        });

        this.subElements.filterStatus.addEventListener('change', async event => {
            if (this.subElements.filterName.value.trim() !== '') {
                const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category&price_gte=${this.fromPrice}&price_lte=${this.toPrice}&title_like=${this.subElements.filterName.value.trim()}&status=${this.subElements.filterStatus.value}&_sort=title&_order=asc&_start=0&_end=30`);
            }
            const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category&price_gte=${this.fromPrice}&price_lte=${this.toPrice}&status=${this.subElements.filterStatus.value}&_sort=title&_order=asc&_start=0&_end=30`);
            this.components.sortableTable.renderRows(data);
          })
      }

    sortableTable() {
        const url = this.linkAttributes({
            '_embed': 'subcategory.category',
            '_sort': 'title',
            '_order': 'asc',
            '_start': 0,
            '_end': 30
        }, 'api/rest/products');

        this.components.sortableTable = new SortableTable(header, {url});

        return this.components.sortableTable.element;
    }

    linkAttributes(attr, path) {
        const url = new URL(path, process.env.BACKEND_URL);

        for (const [key, value] of Object.entries(attr)) {
            url.searchParams.set(key, value);
        }

        return url.href;
    }

    getSubElements($element) {
        const elements = $element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }
}
