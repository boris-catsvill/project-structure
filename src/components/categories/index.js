import SortableList from '@/components/sortable-list/index.js';
import NotificationMessage from '@/components/notification/index.js';
import fetchJson from '@/utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Categories {
  element;

  onToggle = event => {
    const element = event.target.closest('.category__header');

    if (!element) return;

    element.parentElement.classList.toggle('category_open');
  }

  onReorder = event => {
    const items = event.target.querySelectorAll('[data-id]');
    const data = this.getReorderData(items);

    this.updateCategoryOrder(data);
  }

  async render() {
    this.categories = await this.loadData();

    this.element = document.createElement('div');
    this.element.append(...this.createCategories());

    this.initEventListeners();
  }

  loadData() {
    return fetchJson(`${BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async updateCategoryOrder(data) {
    try {
      await fetchJson(`${BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      this.showNotification('Category order saved');
    } catch (error) {
      const message = 'Error saving category order';

      console.error(message, error);
      this.showNotification(message, 'error');
    }
  }

  getReorderData(items) {
    return [...items].map((item, index) => {
      const id = item.dataset.id;
      const weight = index + 1;

      return {
        id,
        weight
      }
    });
  }

  createCategories() {
    return this.categories
      .map(({ id, title, subcategories }) => {
        const element = document.createElement('div');

        element.className = 'category category_open';
        element.setAttribute('data-id', id);
        element.innerHTML = `<header class="category__header">${title}</header>`;

        const body = document.createElement('div');

        body.className = 'category__body';
        body.append(this.createSubcategories(subcategories));

        element.append(body);

        return element;
      });
  }

  createSubcategories(subcategories) {
    const element = document.createElement('div');
    const sortableList = new SortableList({
      items: subcategories.map(item => this.getSubcategoryItem(item))
    });

    element.className = 'subcategory-list';
    element.append(sortableList.element);

    return element;
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onToggle);
    this.element.addEventListener('sortable-list-reorder', this.onReorder);
  }

  getSubcategoryItem({ id, title, count }) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${id}">
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>
    `;

    return wrapper.firstElementChild;
  }

  showNotification(message = '', type = 'success', duration = 2000) {
    const notification = new NotificationMessage(message, { type, duration });

    notification.show();
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
