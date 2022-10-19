import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};

  constructor() {
    this.categoriesData = []
  }

  showNotification(type, message) {
    const notification = new NotificationMessage(message, { duration: 2000, type: type });

    notification.show();
  }

  async updateCategoryOrder(data) {
    const subcategories = this.getSubcategoriesOrder(data);

    try {
      await fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(subcategories)
      });

      this.showNotification('success', 'Сохранено');
    } catch (error) {
      this.showNotification('error', 'Что-то пошло не так');
    }
  }

  getSubcategoriesOrder(data) {
    const result = [];

    const items = data.querySelectorAll('li');
    items.forEach((item, index) => {
      result.push({
        id: item.dataset.id,
        weight: index + 1
      });
    });

    return result;
  }

  async loadCategoriesData() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const data = await fetchJson(url);

    return data;
  }

  addEventListeners() {
    this.element.addEventListener('pointerdown', this.onClickCategory);

    this.subElements.categoriesContainer.addEventListener('sortable-list-reorder', event => {
      const { from, to } = event.detail;
      this.updateCategoryOrder(event.target);
    })
  }

  onClickCategory = event => {
    if (event.target.closest('.category__header')) {
      const element = event.target.closest('.category__header').parentNode;
      element.classList.toggle('category_open');
    }
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    const categories = await this.loadCategoriesData();
    this.categoriesData = categories;

    this.getCategories();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element="categoriesContainer">
          ${''}
        </div>
      </div>
    `
  }

  getCategories() {
    for (const category of this.categoriesData) {
      const categoryFragment = document.createElement('div');
      categoryFragment.className = 'category'
      categoryFragment.classList.add('category_open');
      categoryFragment.dataset.id = `${category.id}`
      categoryFragment.innerHTML = `<header class="category__header">${category.title}</header>`;

      if (category.subcategories) {
        categoryFragment.append(this.getSubcategories(category.subcategories));
      }

      this.subElements.categoriesContainer.append(categoryFragment);
    }
  }

  getSubcategories(subcategories) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="category__body">
        <div class="subcategory-list"></div>
      <div>
    `;
    const categoryBody = wrapper.firstElementChild;

    const items = subcategories.map(subcategory => {
      return this.getSubcategoryItem(subcategory);
    })

    const sortableList = new SortableList({ items });

    const list = categoryBody.querySelector('.subcategory-list')
    list.append(sortableList.element);

    return categoryBody;
  }

  getSubcategoryItem(item) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="categories__sortable-list-item" data-id="${item.id}" data-grab-handle style>
        <strong>${item.title}</strong>
        <span><b>${item.count}</b> products</span>
      </li>
    `;

    return wrapper.firstElementChild;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
