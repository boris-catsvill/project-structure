import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', BACKEND_URL);

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();

    // this.initEventListeners();

    return this.element;
  }


  getTemplate(){
    return `
    <div class="sales full-height flex-column">
      <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <div data-element="rangePicker" class="rangepicker"></div>
      </div>
      <div data-element="sortableTable" class="full-height flex-column"></div>
    </div>
    `
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    })
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    })

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`,
    })

    this.components = {
      sortableTable,
      rangePicker
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy () {
    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
}

//api/rest/orders?createdAt_gte=2022-09-23T16%3A57%3A43.508Z&createdAt_lte=2022-10-23T16%3A57%3A43.508Z&_sort=createdAt&_order=desc&_start=0&_end=30


//my panel
///api/rest/orders?createdAt_gte=2022-09-23T16%3A49%3A59.133Z&createdAt_lte=2022-10-23T16%3A49%3A59.133Z&_sort=id&_order=asc&_start=0&_end=30&_embed=subcategory.category