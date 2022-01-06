import SortableList from '../sortable-list/index.js';
import NotificationMessage from '../notification/index.js';
import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Categories {
  element;
  apiCategoriesUrl = 'api/rest/categories';
  apiCategoriesParams = {
    '_sort': 'weight',
    '_refs': 'subcategory'
  };
  fileElement;

  constructor () {
    this.render();
  }

  async render () {
    const element = document.createElement('div');
    this.element = element;

    const categoriesData = await this.loadCategoriesData();

    const categoriesHtml = this.renderCategories(categoriesData);
    for (const item of categoriesHtml) {
      this.element.append(item);
    }

    this.addEventListeners();

    return this.element;
  }

  async loadCategoriesData() {
    const url = new URL(this.apiCategoriesUrl, BACKEND_URL);

    for (const [key, value] of Object.entries(this.apiCategoriesParams)) {
      url.searchParams.set(key, value);
    }

    const data = await fetchJson(url);

    return data;
  }

  async save(data) {
    const subcategories = this.getSubcategoryData(data);

    try {
      await fetchJson(`${BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(subcategories)
      });

      this.showNotification('success', 'Categories order saved.');
    } catch (error) {
      this.showNotification('error', `Something went wrong :( ${error}`);
    }
  }

  addEventListeners() {
    this.element.addEventListener('pointerdown', this.onCategoryHeaderClick);
    this.element.addEventListener('list-sorted', this.onSubcategoriesSorted);
  }

  onSubcategoriesSorted = (event) => {
    this.save(event.detail);
  }

  onCategoryHeaderClick = (event) => {
    if (event.target.closest('.category__header')) {
      const parent = event.target.closest('.category__header').parentElement;
      parent.classList.toggle('category_open');
    }
  }

  renderCategories(data) {
    const result = [];

    for (const item of data) {
      const itemHtml = document.createElement('div');
      itemHtml.classList.add('category', 'category_open');
      itemHtml.setAttribute('data-id', item.id);
      itemHtml.innerHTML = `<header class="category__header">${item.title}</header>`;

      if (item.subcategories) {
        itemHtml.append(this.renderSubcategories(item.subcategories));
      }

      result.push(itemHtml);
    }

    return result;
  }

  renderSubcategories(items) {
    const body = document.createElement('div');
    body.classList.add('category__body');

    const list = document.createElement('div');
    list.classList.add('subcategory-list');

    body.append(list);

    const sortableList = new SortableList({
      items: items.map(item => {
        return this.getSubcategoryItem(item);
      })
    });
    list.append(sortableList.element);

    return body;
  }

  getSubcategoryItem(item) {
    const element = document.createElement('li');
    element.classList.add('categories__sortable-list-item', 'sortable-list__item');
    element.setAttribute('data-grab-handle', '');
    element.setAttribute('data-id', item.id);

    element.innerHTML = `
      <strong>${item.title}</strong>
      <span><b>${item.count}</b> products</span>
    `;

    return element;
  }

  getSubcategoryData(data) {
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

  showNotification (type, message) {
    const notification = new NotificationMessage(message, {type: type, duration: 4000});

    notification.show();
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
