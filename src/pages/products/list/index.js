import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import fetchJson from "../../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ProductsList {
  header = [
    {
      id: 'images',
      title: 'Фото',
      sortable: false,
      template: (data = []) => {
        return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
          </div>
        `;
      }
    },
    {
      id: 'title',
      title: 'Название',
      sortable: true,
      sortType: 'string'
    },
    {
      id: 'subcategory',
      title: 'Категория',
      sortable: true,
      sortType: 'string',
      template: (item = {}) => {
        return `<div class="sortable-table__cell">${item.title}</div>`;
      }
    },
    {
      id: 'quantity',
      title: 'Количество',
      sortable: true,
      sortType: 'number'
    },
    {
      id: 'price',
      title: 'Цена',
      sortable: true,
      sortType: 'number',
      template: item => {
        return `<div class="sortable-table__cell">$${item}</div>`;
      }
    },
    {
      id: 'status',
      title: 'Статус',
      sortable: true,
      sortType: 'number',
      template: data => {
        return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
      }
    },
  ];

  constructor({
    url = `/api/rest/products`,
    embed = 'subcategory.category',
    sort = 'title',
    order = 'asc',
    start = 0,
    end = 30,
    dates = {
        from: new Date((new Date).getTime() - 30 * 24 * 3600 * 1000),
        to: new Date()
    }

} = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.embed = embed;
    this.sort = sort;
    this.order = order;
    this.start = start;
    this.end = end;
    this.from = '';
    this.to = '';
    this.render();
}

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    wrapper.remove();

    this.subElements = this.element.querySelectorAll('[data-elem]');
    this.subElements = [...this.subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;
      return accum;
    }, {});

    this.initURL();
    this.initDoubleSlider();
    this.initTable();
  }

  initDoubleSlider() {
    const slider = new DoubleSlider({
      min: 0,
      max: 4000,
      formatValue: value => '$' + value,
      selected: {
        from: 0,
        to: 4000
      }
    });

    this.subElements.sliderContainer.append(slider.element);

    slider.element.addEventListener('range-select', async (evt) => {
      this.from = evt.detail.from;
      this.to = evt.detail.to;

      this.table.priceLow = this.from;
      this.table.priceHigh = this.to;

      this.table.updateData(this.url);
    });
  }

  initTable() {
    this.table = new SortableTable(this.header, {
      url: this.url
    });

    this.subElements.productsContainer.append(this.table.element);
  }

  initURL() {
      this.url.searchParams.set('_embed', this.embed);
      this.url.searchParams.set('_sort', this.sort);
      this.url.searchParams.set('_order', this.order);
      this.url.searchParams.set('_start', this.start);
      this.url.searchParams.set('_end', this.end);
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
              <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
            </div>
            <div class="form-group" data-elem="sliderContainer">
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
        <div data-elem="productsContainer" class="products-list__container"></div>
      </div>
  `;
  }
}