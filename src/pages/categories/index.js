import SortableList from '../../components/sortable-list/index.js';
// import NotificationMessage from '../../components/notification/index.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;
export default class Page {
  element;

  async render() {
    const element = document.createElement('div');

    this.element = element;

    const categoriesData = await this.loadCategoriesData();

    this.renderCategories(categoriesData);

    this.initEventListeners();

    return this.element;
  }

  async loadCategoriesData() {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

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

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onCategoryHeaderClick);
  }

  onCategoryHeaderClick = event => {
    if (event.target.closest('.category__header')) {
      const element = event.target.closest('.category__header').parentNode;
      element.classList.toggle('category_open');
    }
  };

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

      this.element.append(itemHtml);
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

  destroy() {
    this.element = null;
  }
}
