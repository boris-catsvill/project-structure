import ProductForm from "../../../components/product-form";
import RangeSlider from "../../../components/double-slider";
import SortableTable from "../../../components/sortable-table";
import header from './products-header';

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.getRangeSlider();
    this.getSortableTable();

    return this.element;
  }

  getRangeSlider() {
    const rangeSliderContainer = this.element.querySelector('[data-elem="sliderContainer"]');

    const rangeSlider = new RangeSlider();

    rangeSliderContainer.append(rangeSlider.element);

    this.components.rangeSlider = rangeSlider;
  }

  getSortableTable() {
    const tableContainer = this.element.querySelector('[data-elem="productsContainer"]');

    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products'
    });

    tableContainer.append(sortableTable.element);

    this.components.sortableTable = sortableTable;
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
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Цена:</label>
            <!-- rage-slider component -->
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


      <div data-elem="productsContainer" class="products-list__container">
        <!-- sortable-table component -->
      </div>
    </div>
    `
  }

  initComponents() {
    const productId = '101-planset-lenovo-yt3-x90l-64-gb-3g-lte-cernyj';

    this.components.productFrom = new ProductForm(productId);
  }

  async renderComponents() {
    const element = await this.components.productFrom.render();

    this.element.append(element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
