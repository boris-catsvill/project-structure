import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './list-header';

export default class Page {

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    await this.initComponents();

    this.subElements.productsContainer.append(this.sortableTable.element);
    this.subElements.doubleSlider.append(this.doubleSlider.element);

    return this.element;
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.doubleSlider.destroy();
    this.sortableTable.destroy();
    this.remove();
  }
}
