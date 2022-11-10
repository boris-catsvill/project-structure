import SortableTable from '../../../components/sortable-table/index.js';
import header from './productsHeader.js';
import DoubleSlider from '../../../components/double-slider/index.js';

import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async updateTableComponent (start = 0, end = 20) {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=${start}&_end=${end}`);
    this.components.sortableTable.addRows(data);
  }

  async getTableDataWithPrice({price_gte = 0, price_lte = 4000, start = 0, end = 20}) {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category&price_gte=${price_gte}&price_lte=${price_lte}&_sort=title&_order=asc&_start=${start}&_end=${end}`)
    this.components.sortableTable.addRows(data)
  }

  async initComponents () {
    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30',
      rowTemplate: (innerHTML, item) => `<a href="/products/${item.id}" class="sortable-table__row">${innerHTML}</a>`
    });

    const slider = new DoubleSlider({
      min: 0,
      max: 4000,
    });

    this.components.slider = slider;
    this.components.sortableTable = sortableTable;
  }

  get template () {
    return `
        <div class="products-list">
            <div class="content__top-panel">
                <h1 class="page-title">Товары</h1>
                <a class="button-primary" href="/products/add">Добавить товар</a>
            </div>
            <div class="content-box content-box_small">
                <form class="form-inline">
                    <div class="form-group">
                        <label class="form-label">Сортировать по:</label>
                        <input class="form-control" type="text" data-element="filterName" placeholder="Название товара"/>
                    </div>
                    <div class="form-group" data-element="slider">
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
            </div>
            <div class="products-list__container" data-element="sortableTable"></div>
        </div>
    `;
  }

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  filterByStatus = async (event) => {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category&price_gte=0&price_lte=4000&status=${event.target.value}&_sort=title&_order=asc&_start=0&_end=30`)
    this.components.sortableTable.addRows(data)
  }
  
  filterByName = async (event) => {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category&price_gte=0&price_lte=4000&title_like=${event.target.value}&_sort=title&_order=asc&_start=0&_end=30`)
    this.components.sortableTable.addRows(data)
  }

  initEventListeners () {
    this.components.slider.element.addEventListener('range-select', (event) => {
      const {from, end} = event.detail
      this.getTableDataWithPrice({price_gte: from, price_lte: end})
    })
    this.subElements.filterStatus.addEventListener('change', this.filterByStatus)
    this.subElements.filterName.addEventListener('input', this.filterByName)
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
