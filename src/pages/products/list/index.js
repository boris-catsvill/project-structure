import SortableTable from '~components/sortable-table/index.js';
import RangeSlider from '~components/double-slider/index.js';
import header from './products-header.js';

export default class Page {
  components = {};
  priceMin = 0;
  priceMax = 5000;
  priceFrom = this.priceMin;
  priceTo = this.priceMax;
  status;
  titleLike;
  timer;

  onChangeRange = event => {
    this.priceFrom = event.detail.from;
    this.priceTo = event.detail.to;
    this.updateSortableTable();
  };

  onChangeStatus = event => {
    const value = Number(event.target.value);
    if (value >= 0) this.status = value;
    else this.status = null;
    this.updateSortableTable();
  };

  onInputTitle = event => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.titleLike = event.target.value;
      this.updateSortableTable();
    }, 1000);
  };

  onFilterReset = event => {
    if (!event.target.closest('[data-element="resetFilterBtn"]')) return;
    this.subElements.filterStatus.value = -1;
    this.status = null;

    this.subElements.filterName.value = '';
    this.titleLike = '';

    this.updateRangeSlider();
    this.priceFrom = this.priceMin;
    this.priceTo = this.priceMax;

    this.updateSortableTable();
  };

  render() {
    this.initComponents();
    this.element = this.toHTML(this.getTemplate());
    this.renderComponents();
    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();
    return this.element;
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
            <input
              type="text"
              data-element="filterName"
              class="form-control"
              placeholder="Название товара"
            />
          </div>
          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Цена:</label>
            <div data-rangeSlider>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="-1" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
      </div>
      <div data-elem="productsContainer" class="products-list__container">
        <div data-sortableTable>
        </div>
      </div>
    </div>
    `;
  }

  initComponents() {
    const rangeSlider = this.initRangeSlider();
    const sortableTable = this.initSortableTable();

    this.components = {
      rangeSlider,
      sortableTable
    };
  }

  initSortableTable(
    price_gte = this.priceFrom,
    price_lte = this.priceTo,
    status = this.status,
    titleLike = this.titleLike
  ) {
    const productsUrl = new URL('api/rest/products', process.env.BACKEND_URL);
    productsUrl.searchParams.set('_embed', 'subcategory.category');
    if (price_gte) productsUrl.searchParams.set('price_gte', price_gte);
    if (price_lte) productsUrl.searchParams.set('price_lte', price_lte);
    if (status || status === 0) productsUrl.searchParams.set('status', status);
    if (titleLike) productsUrl.searchParams.set('title_like', titleLike);
    const sortableTable = new SortableTable(header, {
      url: productsUrl.toString(),
      rowTemplate: (content, dataItem) => `<a href="/products/${dataItem.id}" class="sortable-table__row">${content}</a>`,
      sorted: {
        id: 'title',
        order: 'asc'
      }
    });
    sortableTable.element.dataset.element = 'sortableTable';

    return sortableTable;
  }

  initRangeSlider() {
    const rangeSlider = new RangeSlider({ min: this.priceMin, max: this.priceMax });
    rangeSlider.element.dataset.element = 'rangeSlider';
    return rangeSlider;
  }

  renderComponents() {
    for (const component of Object.entries(this.components)) {
      this.element.querySelector(`[data-${component[0]}]`).replaceWith(component[1].element);
    }
  }

  updateSortableTable() {
    const sortableTable = this.initSortableTable();
    this.subElements.sortableTable.replaceWith(sortableTable.element);
    this.subElements.sortableTable = sortableTable.element;
    this.components.sortableTable.destroy();
    this.components.sortableTable = sortableTable;
  }

  updateRangeSlider() {
    const rangeSlider = this.initRangeSlider();
    this.subElements.rangeSlider.replaceWith(rangeSlider.element);
    this.subElements.rangeSlider = rangeSlider.element;
    this.components.rangeSlider.destroy();
    this.components.rangeSlider = rangeSlider;
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach(el => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  addEventListeners() {
    document.addEventListener('range-select', this.onChangeRange);
    this.subElements.filterStatus.addEventListener('change', this.onChangeStatus);
    this.subElements.filterName.addEventListener('input', this.onInputTitle);
    document.addEventListener('pointerup', this.onFilterReset);
  }

  removeEventListeners() {
    document.removeEventListener('range-select', this.onChangeRange);
    document.removeEventListener('pointerup', this.onFilterReset);
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}
