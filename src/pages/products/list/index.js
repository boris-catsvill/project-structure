import DoubleSlider from '../../../components/double-slider/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import header from './products-header.js';
import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    await this.createComponents();
    this.renderComponents();
    this.initEventListeners();
    return this.element;
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }
    return subElements;
  }

  getTemplate() {
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
          <div class="form-group" data-element="rangePicker">
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
      <div data-element="sortableTable" class="products-list__container">
      </div>
    </div>

    `;
  }

  async createComponents() {
    this.url = new URL('api/rest/products', process.env.BACKEND_URL);
    this.url.searchParams.set('_embed', 'subcategory.category');

    const slider = new DoubleSlider({ min: 0, max: 4000 });
    const sortable = new SortableTable(header, {
      url: this.url
    });

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<p>Не найдено товаров удовлетворяющих выбранному критерию</p>
    <button type="button" class="button-primary-outline">Очистить фильтры</button>`;
    sortable.subElements.emptyPlaceholder.append(wrapper);

    this.originalUrl = new URL(sortable.url);
    this.url = new URL(sortable.url);

    this.components.sortableTable = sortable;
    this.components.rangePicker = slider;
  }

  renderComponents() {
    Object.entries(this.components).forEach(([key, value]) => {
      if (this.subElements[key]) {
        this.subElements[key].append(value.element);
      }
    });
  }

  clickButtonClick = () => {
    this.url = new URL(this.originalUrl);
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.components.rangePicker.update(true);
    this.update();
  };

  changeRangePicker = event => {
    const { from, to } = event.detail;

    if (from === 0 && to === 4000) {
      this.url.searchParams.delete('price_gte');
      this.url.searchParams.delete('price_lte');
      this.update();
      return;
    }
    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);
    this.update();
  };

  changeSearchInput = event => {
    setTimeout(() => {
      if (!event.target.value.length) {
        this.url.searchParams.delete('title_like');
        this.update();
        return;
      }
      this.url.searchParams.set('title_like', event.target.value);
      this.update();
    }, 1500);
  };

  changeStatusInput = event => {
    if (event.target.value !== '') {
      this.url.searchParams.set('status', event.target.value);
      this.update();
      return;
    }
    this.url.searchParams.delete('status');
    this.update();
  };

  initEventListeners() {
    const buttonClear = this.element.querySelector('.button-primary-outline');
    buttonClear.addEventListener('click', this.clickButtonClick);
    this.components.rangePicker.element.addEventListener('range-select', this.changeRangePicker);
    this.subElements.filterName.addEventListener('input', this.changeSearchInput);
    this.subElements.filterStatus.addEventListener('change', this.changeStatusInput);
  }

  async update() {
    const { sortableTable } = this.components;

    const data = await fetchJson(this.url);
    if (data.length) {
      sortableTable.url = new URL(this.url);
      sortableTable.element.classList.remove('sortable-table_empty');
      sortableTable.update(data);
      return;
    }

    sortableTable.element.classList.add('sortable-table_empty');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.url = null;
    this.originalUrl = null;
    this.subElements = null;
    this.element = null;
    Object.values(this.components).forEach(item => item.destroy());
    this.components = {};
  }
}
