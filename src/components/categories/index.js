import SortableList from '../sortable-list/index.js';
import Notification from '../notification/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

import { NOTIFICATION_TYPE, CATEGORIES_REST_URL, SUBCATEGORIES_REST_URL, BACKEND_URL } from '../../constants/index.js';

export default class Categories {
  element;

  constructor() {
    this.url = new URL(CATEGORIES_REST_URL, BACKEND_URL);
    this.render()
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }

  async loadCategories() {
    this.url.searchParams.set('_sort', 'weight');
    this.url.searchParams.set('_refs', 'subcategory');
    return await fetchJson(this.url);
  }

  async render() {
    this.element = document.createElement('div');
    this.element.dataset.element = 'categories';

    this.data = await this.loadCategories();

    this.element.append(...this.renderCategories());
  }

  renderCategories() {
    return this.data.map(category => new Category(category).element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

class Category {
  element;

  onClick = event => {
    if (event.target.classList.contains('category__header')) {
      this.toggle();
    }
  }

  onListOrderUpdate = () => {
    this.saveOrder()
      .then(() => new Notification('Изменения сохранены!', {type: NOTIFICATION_TYPE.success}).show())
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }

  constructor(data) {
    this.data = data;
    this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    this.element.querySelector('.subcategory-list').append(this.createSubcategoriesList());

    this.initEventListeners();
  }

  initEventListeners() {
    this.element.addEventListener('click', this.onClick);
    this.element.addEventListener('list-order-update', this.onListOrderUpdate);
  }

  get template() {
    return `
      <div class="category category_open" data-id="${this.data.id}">
        <header class="category__header">
          ${escapeHtml(this.data.title)}
        </header>
        <div class="category__body">
          <div class="subcategory-list"></div>
        </div>
      </div>
    `;
  }

  toggle() {
    this.element.classList.toggle('category_open');
  }

  createSubcategoriesList() {
    const sortableList = new SortableList({
      items: this.data.subcategories.map(subcategory => this.createSubcategoriesListItem(subcategory))
    });

    return sortableList.element;
  }

  createSubcategoriesListItem({id, title, count}) {
    const element = document.createElement('div');

    element.innerHTML = `
      <li class='categories__sortable-list-item sortable-list__item' data-grab-handle='' data-id='${id}'>
        <strong>${escapeHtml(title)}</strong>
        <span><b>${count}</b> товаров</span>
      </li>
    `;
    return element.firstElementChild;
  }

  async saveOrder() {
    const order = [...this.element.querySelectorAll('.sortable-list__item')]
      .map((element, index) => {
        return {
          id: element.dataset.id,
          weight: index + 1
        };
      });

    this.data.subcategories = await fetchJson(new URL(SUBCATEGORIES_REST_URL, BACKEND_URL), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
