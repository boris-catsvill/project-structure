import SortableTable from "../../../components/sortable-table";
import DoubleSlider from "../../../components/double-slider"
import header from "./header-config";

export default class Page {
  element;
  subElements = {};
  components = {};
  url;

  getTemplateHeader() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary link">Добавить товар</a>
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
                <option value selected>Любой</option>
                <option value="1">Активный</option>
                <option value="0">Неактивный</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplateHeader();

    this.element = wrapper.firstElementChild;

    this.initComponents();
    this.renderComponents();

    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    this.url = new URL('api/rest/products', process.env.BACKEND_URL);
    this.url.searchParams.set('_embed', 'subcategory.category');

    const sortableTable = new SortableTable(header, {
      url: this.url,
      isSortLocally: false
    });

    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000
    });

    this.components = {
      sortableTable,
      doubleSlider
    }
  }

  renderComponents() {
    const sliderContainer = this.element.querySelector('[data-element="sliderContainer"]');

    sliderContainer.append(this.components.doubleSlider.element)
    this.element.append(this.components.sortableTable.element);
  }

  initEventListeners() {
    const form = this.element.querySelector('.form-inline');
    const slider = this.element.querySelector('.range-slider');

    form.addEventListener('input', event => this.formChange(event));
    slider.addEventListener('range-select', event => this.formChange(event));
  }

  formChange(event) {
    event.preventDefault();

    const target = event.target;

    if (target.dataset.element === 'rangeSlider') {
      const from = event.detail.from;
      const to = event.detail.to;

      this.url.searchParams.set('price_gte', from);
      this.url.searchParams.set('price_lte', to);
    }

    if (target.dataset.element === 'filterName') {
      const input = target.closest('[data-element="filterName"]');

      this.url.searchParams.set('title_like', input.value);
    }

    if (target.dataset.element === 'filterStatus') {
      const select = target.closest('[data-element="filterStatus"]');

      if (select.value === '') {
        this.url.searchParams.delete('status');
      } else {
        this.url.searchParams.set('status', select.value);
      }
    }

    this.sortableTableUpdate(this.url);
  }

  sortableTableUpdate(url) {
    this.components.sortableTable.destroy();

    this.components.sortableTable = new SortableTable(header, {
      url
    });

    this.element.append(this.components.sortableTable.element);
  }

  getSubElements(element) {
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
