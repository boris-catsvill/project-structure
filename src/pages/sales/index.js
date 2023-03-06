import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './header.js';

export default class Page {
  element = {};
  subElements = {};
  range = {};
  components = {};
  controller = new AbortController();

  date = new Date();
  range = {
    to: new Date(),
    from: new Date(this.date.setMonth(this.date.getMonth() - 1))
  };

  async render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;
    this.getSubElements();
    this.initComponents();
    this.appendComponents();
    this.initListeners();

    return this.element;
  }
  initComponents() {
    this.components['rangePicker'] = new RangePicker(this.range);
    this.components['ordersContainer'] = new SortableTable(header, {
      url: 'api/rest/orders',
      range: this.range,
      namesForApiRange: {
        from: 'createdAt_gte',
        to: 'createdAt_lte'
      },
      linkRow: null
    });
  }

  appendComponents() {
    for (const [name, instance] of Object.entries(this.components)) {
      if (Object.hasOwn(this.subElements, name)) {
        this.subElements[name].append(instance.element);
      }
    }
  }

  initListeners() {
    document.addEventListener('date-select', this.rangeChanged, {
      signal: this.controller.signal
    });
  }

  rangeChanged = async ({ detail }) => {
    this.range = detail;

    for (const instance of Object.values(this.components)) {
      if (instance instanceof SortableTable) {
        instance.loadData(this.range);
      }
    }
  };

  getSubElements() {
    for (const item of this.element.querySelectorAll('[data-element]')) {
      this.subElements[item.dataset.element] = item;
    }
  }

  //   https://course-js.javascript.ru/api/rest/orders?createdAt_gte=2023-01-24T09:17:40.417Z&createdAt_lte=2023-02-23T09:17:40.417Z&_sort=createdAt&_order=desc&_start=0&_end=30
  getTemplate() {
    return `<div class="sales full-height flex-column">
        <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
        </div>
        <div data-element="ordersContainer" class="full-height flex-column">
        <!-- sortable-table component -->
        </div>
    </div>`;
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
    this.charts = null;
    this.controller.abort();

    for (const instance of Object.values(this.components)) {
      if (Object.hasOwn(instance, 'destroy')) {
        instance.destroy();
      }
    }
    this.components = null;
  }
}

{
  /* <div class="sales full-height flex-column">
  <div class="content__top-panel">
    <h1 class="page-title">Продажи</h1>
    <div class="rangepicker">
      <div class="rangepicker__input" data-elem="input">
        <span data-elem="from">24.01.2023</span> -<span data-elem="to">23.02.2023</span>
      </div>
      <div class="rangepicker__selector" data-elem="selector"></div>
    </div>
  </div>
  <div data-elem="ordersContainer" class="full-height flex-column">
    <div class="sortable-table">
      <div data-elem="header" class="sortable-table__header sortable-table__row">
        <div class="sortable-table__cell" data-name="id" data-sortable="">
          <span>ID</span>
        </div>
        <div class="sortable-table__cell" data-name="user" data-sortable="">
          <span>Клиент</span>
        </div>
        <div class="sortable-table__cell" data-name="createdAt" data-sortable="">
          <span>Дата</span>
          <span class="sortable-table__sort-arrow">
            <span class="sortable-table__sort-arrow_desc"></span>
          </span>
        </div>
        <div class="sortable-table__cell" data-name="totalCost" data-sortable="">
          <span>Стоимость</span>
        </div>
        <div class="sortable-table__cell" data-name="delivery" data-sortable="">
          <span>Статус</span>
        </div>
      </div>

      <div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
      <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>Нет заказов</p>
        </div>
      </div>
    </div>
  </div>
</div>; */
}
