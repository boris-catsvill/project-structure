import SortableList from '../sortable-list';
import fetchJson from '../../utils/fetch-json.js';
import Notification from '../../components/notification';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Categories {
  element;

  constructor(url) {
    this.url = new URL(BACKEND_URL + '/' + url);
  }

  async render() {
    this.data = await this.fetchData();

    const element = document.createElement('div');
    this.data.map(item => {
      const category = this.dataTemplate(item);
      const list = category.querySelector('[data-element="list"]');
      const subcategoryTempArr = this.subcategoryTemplate(item.subcategories);
      const sortableListComponent = this.sortableListModule(subcategoryTempArr);

      list.append(sortableListComponent);
      element.append(category);
    });
    this.element = element;

    this.initEventListeners();
    return this.element;
  }

  async fetchData(url = this.url) {
    const data = await fetchJson(url);
    return data;
  }

  async patchData(data) {
    try {
      const method = 'PATCH';
      const response = await fetchJson(`${BACKEND_URL}/api/rest/subcategories`, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      new Notification('Category order saved');
    } catch (error) {
      new Notification(error, { type: 'error' });
      console.error(error);
    }
  }

  sortableListModule(items) {
    const sortableList = new SortableList(items);
    return sortableList.element;
  }

  closeCategory = event => {
    const target = event.target.closest('[data-element="header"]');
    if (!target) return;

    target.parentNode.classList.toggle('category_open');
  };

  orderChangeEvent = event => {
    const elementsId = event.detail.elementsId;
    const dataArr = [];

    elementsId.map((element, index) => {
      const data = { id: element, weight: index + 1 };
      dataArr.push(data);
    });

    this.patchData(dataArr);
  };

  initEventListeners() {
    this.element.addEventListener('click', this.closeCategory);
    document.addEventListener('order-change', this.orderChangeEvent);
  }

  subcategoryTemplate(data) {
    const template = data.map(item => {
      return `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${item.id}">
          <strong>${item.title}</strong>
          <span><b>${item.count}</b> products</span>
        </li>
      `;
    });
    return template;
  }

  dataTemplate(item) {
    const template = document.createElement('div');
    template.innerHTML = `
      <div class="category category_open" data-id="${item.id}">
        <header class="category__header" data-element='header'>
          ${item.title}
        </header>
        <div class="category__body">
          <div class="subcategory-list" data-element="list"></div>
        </div>
      </div>`;
    return template.firstElementChild;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('order-change', this.orderChangeEvent);
    this.element = null;
  }
}
