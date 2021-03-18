import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import fetchJson from "../../../utils/fetch-json.js";
import PageEdit from "../edit/index.js";
import ProductForm from '../../../components/product-form/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  header = [
    {
      id: 'images',
      title: 'Фото',
      sortable: false,
      template: (data = []) => {
        return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0].url}">
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
} = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.embed = embed;
    this.sort = sort;
    this.order = order;
    this.start = start;
    this.end = end;
    this.from = '';
    this.to = '';
    this.page = 'products';
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

    this.initEventListeners();

    return this.element;
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

      this.url.searchParams.set('price_gte', this.from);
      this.url.searchParams.set('price_lte', this.to);

      const data = await fetchJson(this.url);

      this.table.renderRows(data);
      this.table.url = this.url;
    });
  }

  initTable() {
    this.table = new SortableTable(this.header, {
      url: this.url,
      step: 30,
      start: 0,
      page: this.page
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

  initEventListeners() {
    this.subElements.filterName.addEventListener('input', async evt => {
      this.url.searchParams.set('title_like', evt.target.value);

      const data = await fetchJson(this.url);
      this.table.renderRows(data);
      this.table.url = this.url;
    });

    this.subElements.filterStatus.addEventListener('change', async evt => {

      if (evt.target.value === '1' || evt.target.value === '0') {
        this.url.searchParams.set('status', evt.target.value);
      } else {
        this.url.searchParams.delete('status');
      }

      const data = await fetchJson(this.url);
      this.table.renderRows(data);
      this.table.url = this.url;
    });
    
    // this.subElements.productsContainer.addEventListener('pointerdown', evt => {

    //   if (!evt.target.closest('a').classList.contains('sortable-table__row')) return;
    //   // setTimeout(() => { this.changePage() }, 1000);
    //   const href = evt.target.closest('a').getAttribute('href');
    //   const id = href.split('/products/')[1];
    //   const newPage = new PageEdit(id);
    //   // this.remove();
    //   document.querySelector('#content').append(newPage.render());
    // });
  }

  // async changePage() {
  //   const href = window.location.pathname;
  //   const id = href.split('/products/')[1];
  //   const newPage = new PageEdit(id).render();
  //   console.log(newPage);

  //   // this.element.remove();

  //   document.querySelector('#content').append(newPage);
  // }

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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}