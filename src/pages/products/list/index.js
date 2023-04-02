import SortableTable from '../../../components/sortable-table';
import headerConfig from '../bestsellers-header.js';
import DoubleSlider from '../../../components/double-slider';
import fetchJson from '../../../utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.initComponents();
    this.initEventListeners();
    return this.element;
  }
  getTemplate() {
    return `
    <div class="products-list">
    <div class="content__top-panel">
    <h1 class="page-title">Товар</h1>
    <a href="/products/add" class="button-primary">Добавить товар</a>
    </div>
    <div class="content-box content-box_small">
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
    <option value="1">Активен</option>
    <option value="0">неактивен</option>
    </select>
    </div>
    </form>
    </div>
    <div data-element="productsContainer" class="products-list__container"></div>
    </div>
    `;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }
  initComponents() {
    this.getSortableTable();
    this.getSlider();
  }
  getSortableTable() {
    const sortableTable = (this.components.sortableTable = new SortableTable(headerConfig, {
      url: `api/rest/products?_embed=subcategory.category`,
      isSortLocally: true
    }));
    this.subElements.productsContainer.append(sortableTable.element);
  }

  getSlider() {
    const { sliderContainer } = this.subElements;
    const slider = new DoubleSlider({
      min: 0,
      max: 4000,
      formatValue: value => '$' + value
    });
    sliderContainer.append(slider.element);
  }
  initEventListeners() {
    const { filterStatus, filterName } = this.subElements;
    filterStatus.addEventListener('change', this.onFilterStatusChange);
    this.element.addEventListener('range-select', this.onRangeSelect);
    filterName.addEventListener('input', this.onFilterNameChange);
  }

  onRangeSelect = async event => {
    this.from = event.detail.from;
    this.to = event.detail.to;
    const response = await this.loadData();
    this.components.sortableTable.update(response);
    this.components.sortableTable.removeEventListener();
  };
  onFilterStatusChange = async event => {
    const filterStatus = event.target.value;
    const response = await this.loadData({ status: filterStatus });
    this.components.sortableTable.update(response);
  };
  onFilterNameChange = async event => {
    const filterName = event.target.value;
    const response = await this.loadData({ value: filterName });
    this.components.sortableTable.update(response);
    this.components.sortableTable.removeEventListener();
  };
  loadData({ status = false, value = '' } = {}) {
    const {
      start,
      end,
      sorted: { id, order }
    } = this.components.sortableTable;
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('price_gte', this.from || 0);
    url.searchParams.set('price_lte', this.to || 4000);
    if (status) {
      url.searchParams.set('status', status);
    }
    if (value) {
      url.searchParams.set('title_like', value);
    }
    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);
    return fetchJson(url);
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
}
