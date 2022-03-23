import DoubleSlider from '../../../components/double-slider/index';
import SortableTable from '../../../components/sortable-table/index';
import { headers } from './products-headers';
import fetchJson from '../../../utils/fetch-json';

export default class Page {
  element = {};
  subElements = {};
  components = {};

  get template() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
                <label for="filter" class="form-label">Сортировать по: </label>
                <input type="text" data-elem="filterName" name="filterName" id="filter" class="form-control" placeholder="Название товара" />
            </div>
            <div class="form-group" data-element="rangeSlider">
                <label class="form-label">Цена:</label>
            </div>
            <div class="form-group">
                <label class="form-label">Статус:</label>
                <select name="filterStatus" class="form-control">
                  <option value selected>Любой</option>
                  <option value="1">Активный</option>
                  <option value="2">Нективный</option>
                </select>
            </div>
          </form>
          </div>
          <div data-element="sortableTable" class="products-list__container"></div>
      </div>
    `;
  }

  loadData = async () => {
    
  };

  getComponents = () => {
    const rangeSlider = new DoubleSlider({
      min: 0,
      max: 4000,
    });

    const sortableTable = new SortableTable(headers, {
      isSortLocally: false,
      url: `api/rest/products?&_embed=subcategory.category`,
    });

    this.components = {
      rangeSlider,
      sortableTable
    };
  };

  renderComponents = () => {
    Object.keys(this.components).forEach(item => {
      this.subElements[item].append(this.components[item].element);
    });
  };

  render = () => {
    const wrapper = document.createElement('div');
    wrapper.insertAdjacentHTML('beforeend', this.template);

    this.element = wrapper.firstElementChild;
    this.getSubElements();
    this.getComponents();
    this.renderComponents();

    return this.element;
  };
  
  getSubElements = () => {
    this.subElements = [...this.element.querySelectorAll('[data-element]')].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    Object.values(this.getSubElements).forEach(item => item.destroy());

    this.element = null;
    this.subElements = null;

  };
}