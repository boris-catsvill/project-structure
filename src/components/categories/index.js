import SortableList from '../sortable-list/index.js';
import NotificationMessage from '../../components/notification';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Categories {
  onClickOpen = event => {
    if (!event.target.closest('.category__header')) return;
    event.target.closest('.category').classList.toggle('category_open');
  };

  onDragend = async categoryId => {
    const category = this.categories.find(category => category.id === categoryId);
    const categoryBlock = document.querySelector(`[data-id="${categoryId}"]`);
    const subcategories = categoryBlock.querySelectorAll('.categories__sortable-list-item');
    [...subcategories].forEach((element, index) => {
      const id = element.dataset.id;
      const subcategory = category.subcategories.find(item => item.id === id);
      subcategory.weight = index + 1;
    });
    await this.saveCategoryOrder(category.subcategories);
    const notification = new NotificationMessage('Позиции сохранены', {
      duration: 2000,
      type: 'success'
    });
    notification.show();
  };

  constructor() {
    this.url = new URL('api/rest/categories', BACKEND_URL);
  }

  async render() {
    this.categories = await this.loadData();

    const categoriesList = this.toHTML('<div data-categories></div>');
    categoriesList.append(...this.getCategoriesList(this.categories));
    this.element = categoriesList;
    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();

    return this.element;
  }

  getCategoriesList(categories) {
    const categoriesList = [];
    for (const category of categories) {
      const categoryItem = this.toHTML(this.getTemplate(category.title, category.id));
      const sortableList = this.getSubcategoriesList(category.subcategories);
      categoryItem.querySelector('.subcategory-list').append(sortableList);
      categoriesList.push(categoryItem);
      sortableList.addEventListener('dragend', () => this.onDragend(category.id));
    }
    return categoriesList;
  }

  getSubcategoriesList(subcategories) {
    const subcategoriesList = [];
    for (const subcategory of subcategories) {
      const subcategoryItem = this.toHTML(
        this.getTemplateListItem(subcategory.title, subcategory.id, subcategory.count)
      );
      subcategoriesList.push(subcategoryItem);
    }
    return this.createSortableList(subcategoriesList);
  }

  getTemplate(categoryName, categoryId) {
    return `
        <div class="category category_open" data-id="${categoryId}">
            <header class="category__header">${categoryName}</header>
            <div class="category__body">
                <div class="subcategory-list"></div>
            </div>
        </div>
        `;
  }

  getTemplateListItem(name, subcategoryId, productCount) {
    return `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${subcategoryId}">
            <strong>${name}</strong>
            <span><b>${productCount}</b> products</span>
        </li>
        `;
  }

  async loadData() {
    this.url.searchParams.set('_sort', 'weight');
    this.url.searchParams.set('_refs', 'subcategory');

    try {
      const response = await fetch(this.url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('loadData', error);
    }
  }

  createSortableList(list) {
    const sortableList = new SortableList({
      items: list
    });

    return sortableList.element;
  }

  async saveCategoryOrder(categories) {
    const url = new URL('api/rest/subcategories', BACKEND_URL);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categories),
    });
    const data = await response.json();
  }

  addEventListeners() {
    this.element.addEventListener('click', this.onClickOpen);
  }

  removeEventListeners() {
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach(el => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  remove() {
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}
