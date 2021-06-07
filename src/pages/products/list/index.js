import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js'
import header from './list-header';

import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  searchQuery = {
    title_like: null,
    status: null,
    price_gte: 0,
    price_lte: 4000
  }
  
  async updateTableComponent () {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    if (this.searchQuery.title_like) url.searchParams.set('title_like', this.searchQuery.title_like);
    if (this.searchQuery.status) url.searchParams.set('status', this.searchQuery.status);
    url.searchParams.set('_start', '0');
    url.searchParams.set('_end', '30');
    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'desc');
    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('price_gte', this.searchQuery.price_gte);
    url.searchParams.set('price_lte', this.searchQuery.price_lte);

    const data = await fetchJson(url);
    this.components.sortableTable.addRows(data);
  }

  async initComponents () {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));
   
    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_start=0&_end=30&_sort=title&_order=desc&_embed=subcategory.category`,
      isSortLocally: true,
      sorted: {
        id: 'title',
        order: 'asc'
      },
    });

    this.components.sortableTable = sortableTable;

    const sliderContainer = new DoubleSlider({
      min: 0,
      max: 4000,
    });
    this.components.sliderContainer = sliderContainer;
  }

  get template () {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h2 class="page-title">Товары</h2>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>

      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по: </label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="sliderContainer">
          
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
      </div>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
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

  initEventListeners () {
    // this.components.rangePicker.element.addEventListener('date-select', event => {
    //   const { from, to } = event.detail;
    //   this.updateTableComponent(from, to);
    // });

    const filterName = this.element.querySelector('input[data-elem=filterName]');
    filterName.addEventListener('input', this.sorting)

    const filterStatus = this.element.querySelector('select[data-elem=filterStatus]');
    filterStatus.addEventListener('change', this.filter)

    this.element.addEventListener('range-select', this.changeRangeSelect)
  }

  changeRangeSelect = ({detail}) => {
    const { from, to} = detail;
    this.searchQuery.price_gte = from
    this.searchQuery.price_lte = to
    this.updateTableComponent();
  }

  filter = e => {
    console.log(e.target.value)
    this.searchQuery.status = e.target.value
    this.updateTableComponent();
  }

  sorting = e => {
    this.searchQuery.title_like = e.target.value
    this.updateTableComponent();
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
