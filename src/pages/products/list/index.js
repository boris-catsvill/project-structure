import DoubleSlider from '../../../components/double-slider/index';
import SortableTable from '../../../components/sortable-table/index';
import { headers } from './products-headers';
import fetchJson from '../../../utils/fetch-json';
import debounce from 'lodash.debounce';

export default class Page {
  element = {};
  subElements = {};
  components = {};
  url = new URL('api/rest/products', process.env.BACKEND_URL);
  controls = {};
  filter = {
    from: 0,
    to: 4000,
    status: '',
    title: ''
  };

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
                <input type="text" data-control="filterName" name="filterName" id="filter" class="form-control" placeholder="Название товара" />
            </div>
            <div class="form-group" data-element="rangeSlider" data-control="rangeSlider">
                <label class="form-label">Цена:</label>
            </div>
            <div class="form-group">
                <label class="form-label">Статус:</label>
                <select name="filterStatus" class="form-control" data-control="filterStatus">
                  <option value selected>Любой</option>
                  <option value="1">Активный</option>
                  <option value="0">Нективный</option>
                </select>
            </div>
          </form>
          </div>
          <div data-element="sortableTable" class="products-list__container"></div>
      </div>
    `;
  }

  loadData = async ({title, status, from, to} = this.filter) => {
    this.url.searchParams.set('_embed', 'subcategory.category');
    this.url.searchParams.set('title_like', title);
    if (status) {
      this.url.searchParams.set('status', status);
    } else {
      this.url.searchParams.delete('status');
    }

    this.url.searchParams.set('price_gte', from);
    this.url.searchParams.set('price_lte', to);
    
    return await fetchJson(this.url);
  };

  getComponents = () => {
    this.url.searchParams.set('_embed', 'subcategory.category');
    const rangeSlider = new DoubleSlider({
      min: 0,
      max: 4000,
    });

    const sortableTable = new SortableTable(headers, {
      isSortLocally: false,
      url: this.url,
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
    this.getElementsControl();
    this.getComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  };
  
  initEventListeners = () => {
    const { filterName, rangeSlider, filterStatus } = this.controls;
    const { sortableTable } = this.components;

    rangeSlider.children[1].addEventListener('range-select', async event => {
      this.filter = {
        ...this.filter,
        ...event.detail,
      };
      this.url.searchParams.set('_start', 1);
      const data = await this.loadData(this.filter);

      sortableTable.update(data);
    });

    filterName.addEventListener('input', debounce(this.inputHandler, 300));

    filterStatus.addEventListener('change', async event => {
      const status = event.target.value;
      this.filter = {
        ...this.filter,
        status
      };
      this.url.searchParams.set('_start', 1);
      const data = await this.loadData(this.filter);

      sortableTable.update(data);
    });
  };

  inputHandler = async event => {
    
    const title = event.target.value;
    this.filter = {
      ...this.filter,
      title,
    };

    this.url.searchParams.set('_start', 1);
    const data = await this.loadData(this.filter);

    this.components.sortableTable.update(data);
  };

  getSubElements = () => {
    this.subElements = [...this.element.querySelectorAll('[data-element]')].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  };

  getElementsControl = () => {
    this.controls = [...this.element.querySelectorAll('[data-control]')].reduce((acc, item) => {
      acc[item.dataset.control] = item;
      return acc;
    }, {});
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    Object.values(this.components).forEach(item => item.destroy());
    this.element = null;
    this.subElements = null;
    this.controls = null;
  };
}