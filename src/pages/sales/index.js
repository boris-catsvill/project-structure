import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';

import header from './sales-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  render() {
    const element = document.createElement("div"); // (*)
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to
    });

    this.sortableTable = new SortableTable(header, {
      url: `api/rest/orders?_start=1&_end=20&createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      isSortLocally: false
    });

    this.subElements.rangePicker.append(rangePicker.element);
    this.subElements.sortableTable.append(this.sortableTable.element);

    this.initEventListeners();
    return this.element;
  }

  async update(from, to) {

    const url = new URL('api/rest/orders', BACKEND_URL);
    url.searchParams.set('_start', '1');
    url.searchParams.set('_end', '21');
    url.searchParams.set('_sort', 'createdAt');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());

    let sortableTableUrl = `api/rest/orders?_start=1&_end=20&createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`;
    this.sortableTable.url = new URL(sortableTableUrl, 'https://course-js.javascript.ru');
    await this.sortableTable.reRenderBody();
  }

  initEventListeners () {
    this.subElements.rangePicker.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.update(from, to);
    });
    document.addEventListener('table-update', async() => {
      await this.sortableTable.reRenderBody();
    });
  }

  getTemplate() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }
  get subElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
