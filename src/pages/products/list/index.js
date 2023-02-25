import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './list-header';

export default class Page {
  filterName = '';
  filterStatus = '';
  filterRangeFrom = 0;
  filterRangeTo = 4000;

  onFormNameChange = (event) => {
    this.filterName = event.target.value;
    this.setFilter();
  }

  onFormStatusChange = (event) => {
    this.filterStatus = event.target.value;
    this.setFilter();
  }

  onFormRangeChange = (event) => {
    this.filterRangeFrom = event.detail.from;
    this.filterRangeTo = event.detail.to;
    this.setFilter();
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.formElements = this.getFormElements();

    await this.initComponents();

    this.subElements.productsContainer.append(this.sortableTable.element);
    this.subElements.doubleSlider.append(this.doubleSlider.element);

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {

    Object.values(this.formElements).forEach(value => {
      if (value.dataset.elem === 'filterName') value.addEventListener('input', this.onFormNameChange);
      if (value.dataset.elem === 'filterStatus') value.addEventListener('change', this.onFormStatusChange);
      if (value.dataset.elem === 'sliderContainer') value.addEventListener('range-select', this.onFormRangeChange); 
    })
    
  }

  getTemplate() {
    return `
    <div class='products-list'>
      <div class="content__top-panel">
        <h1 class="page-title">Товары</h1>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>

      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Фильтровать по:</label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-elem="sliderContainer" data-element="doubleSlider">
            <label class="form-label">Цена:</label>
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
      
      <div data-element="productsContainer" class="products-list__container">
      </div>
    </div>
    `
  }

  getFormElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-elem]");

    for (const subElement of elements) {
      const name = subElement.dataset.elem;
      result[name] = subElement;
    }
    return result;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  async initComponents() {
    this.sortableTable = new SortableTable(header, {
      url: 'api/rest/products',
      sorted: { id:'title', order: 'asc'},
      isSortLocally:false,
      step: 30,
      start: 0,
      linked: '/product/',
    });

    this.doubleSlider = new DoubleSlider({min:0, max:4000});
  }

  async setFilter() {
    const filter = {};
    if (this.filterName !== '') filter.title_like = this.filterName;
    if (this.filterStatus !== '') filter.status = this.filterStatus;
    filter.price_gte = this.filterRangeFrom;
    filter.price_lte = this.filterRangeTo;
    this.sortableTable.setFilter(filter);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    Object.values(this.formElements).forEach(value => {
      if (value.dataset.elem === 'filterName') value.removeEventListener('input', this.onFormNameChange);
      if (value.dataset.elem === 'filterStatus') value.removeEventListener('change', this.onFormStatusChange);
      if (value.dataset.elem === 'sliderContainer') value.removeEventListener('range-select', this.onFormRangeChange); 
    })
    this.doubleSlider.destroy();
    this.sortableTable.destroy();
    this.remove();
  }
}
