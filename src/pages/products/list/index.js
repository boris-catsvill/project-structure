import RangeSlider from "../../../components/double-slider";
import SortableTable from "../../../components/sortable-table";
import header from './products-header';
import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30', process.env.BACKEND_URL);
  sortableTableURL = '';
  min = 0;
  max = 4000;
  step = 30;
  start = 0;
  end = this.step + this.start;

  async sortByPrice(from, to) {
    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);

    this.sortableTableURL.searchParams.set('price_gte', from);
    this.sortableTableURL.searchParams.set('price_lte', to);

    const data = await fetchJson(this.url);

    this.element.querySelector('.sortable-table__body').innerHTML = '';

    this.components.sortableTable.update(data);

    this.renderPlaceholder(data);
  }

  async sortByStatus(state) {
    if (state === '1') {
      this.url.searchParams.set('status', '1');
      this.sortableTableURL.searchParams.set('status', '1')

    } else if (state === '0') {
      this.url.searchParams.set('status', '0');
      this.sortableTableURL.searchParams.set('status', '0')

    } else if (state === '') {
      this.url.searchParams.delete('status');
      this.sortableTableURL.searchParams.delete('status');
    }

    const data = await fetchJson(this.url);

    this.element.querySelector('.sortable-table__body').innerHTML = '';

    this.components.sortableTable.update(data);

    this.renderPlaceholder(data);
  }

  async sortByName(name) {
    this.url.searchParams.set('title_like', name);
    this.sortableTableURL.searchParams.set('title_like', name);

    const data = await fetchJson(this.url);

    this.element.querySelector('.sortable-table__body').innerHTML = '';

    this.components.sortableTable.update(data);

    this.renderPlaceholder(data);
  }

  async clearFilters(button) {
    const placeholder = this.element.querySelector('[data-element="emptyPlaceholder"]');
    const sortableTable = this.element.querySelector('.sortable-table');
    const { filterStatus, filterName } = this.subElements;
    const { rangeSlider } = this.components;
    const from = this.element.querySelector('[data-element="from"]');
    const to = this.element.querySelector('[data-element="to"]');

    if ( button ) {
      button.addEventListener('click', async () => {
        this.clearURL(this.url);
        this.clearURL(this.sortableTableURL);

        const data = await fetchJson(this.url);

        this.components.sortableTable.update(data);

        //clear Page
        sortableTable.classList.remove('sortable-table_empty')
        placeholder.innerHTML = '';
        filterStatus.value = '';
        filterName.value = '';

        //clear RangeSlider values
        rangeSlider.selected.from = this.min;
        rangeSlider.selected.to = this.max;
        rangeSlider.update();
        from.textContent = `${this.min}`;
        to.textContent = `${this.max}`;

        //clear SortableTable values
        this.components.sortableTable.end = this.end;
        this.components.sortableTable.start = this.start;
      })
    }
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
    <div class="products-list">

      <div class="content__top-panel">
        <h2 class="page-title">Товары</h2>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>

      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="rangeSlider">
            <label class="form-label">Цена:</label>
            <!-- rage-slider component -->
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
        <!-- sortable-table component -->
      </div>
    </div>
    `
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initComponents() {
    const rangeSlider = new RangeSlider({
      min: this.min,
      max: this.max
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
      step: this.step,
      start: this.start
    })

    this.sortableTableURL = sortableTable.url;

    this.components = {
      rangeSlider,
      sortableTable
    }
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    })
  }

  initEventListeners() {
    this.components.rangeSlider.element.addEventListener('range-select', event => {
      const  { from, to } = event.detail;

      this.components.sortableTable.end = this.end;
      this.components.sortableTable.start = this.start;
      this.components.sortableTable.stopFetching = false;

      this.sortByPrice(from, to);
    });

    this.subElements.filterStatus.addEventListener('change', event => {
      this.components.sortableTable.end = this.end;
      this.components.sortableTable.start = this.start;
      this.components.sortableTable.stopFetching = false;

      this.sortByStatus(event.target.value);
    })

    this.subElements.filterName.addEventListener('input', event => {
      this.components.sortableTable.end = this.end;
      this.components.sortableTable.start = this.start;
      this.components.sortableTable.stopFetching = false;

      this.sortByName(event.target.value);
    })
  }

  getPlaceholderTemplate() {
    return `
    <div>
      <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
      <button type="button" class="button-primary-outline">Очистить фильтры</button>
    </div>
    `
  }

  renderPlaceholder(data) {
    const placeholder = this.element.querySelector('[data-element="emptyPlaceholder"]');
    const sortableTable = this.element.querySelector('.sortable-table');

    if (data.length === 0) {
      const clearFiltersButton = this.element.querySelector('.button-primary-outline');

      sortableTable.classList.add('sortable-table_empty')
      placeholder.innerHTML = this.getPlaceholderTemplate();

      this.clearFilters(clearFiltersButton);

    } else {
      sortableTable.classList.remove('sortable-table_empty')
      placeholder.innerHTML = '';
    }
  }

  clearURL(url) {
    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('_start', `${this.start}`);
    url.searchParams.set('_end', `${this.end}`);
    url.searchParams.delete('status');
    url.searchParams.delete('price_gte');
    url.searchParams.delete('price_lte');
    url.searchParams.delete('title_like');
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
