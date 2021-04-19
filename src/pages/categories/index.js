import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';
import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;
const DATA_API = process.env.DATA_API;

export default class CategoriesPage {
  subElements = {};
  components = {};

  onPointerDown = event => {
    const categoryHeader = event.target.closest('.category__header')
    if (categoryHeader) {
      categoryHeader.closest('.category')
        .classList
        .toggle('category_open');
    }
  }

  onSortableListReorder = async ({ detail: list }) => {
    const data = [...list.children]
      .map((item, index) => ({
        id: item.dataset.id,
        weight: index + 1
      }));

    try {
      await fetchJson(`${BACKEND_URL}${DATA_API}/subcategories`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body:  JSON.stringify(data)
      });

      this.renderNotification('Порядок категорий сохранен!');
    } catch(e) {
      this.renderNotification('Порядок категорий не сохранен!', 'error');
    }
  }

  get getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>

        <div data-element="categoriesContainer" class="categoriesContainer"></div>
      </div>
    `;
  }

  get getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]');

    return [...subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  get getCategoriesWrappers() {
    const { categoriesContainer } = this.subElements;
    const categoriesWrappers = categoriesContainer.querySelectorAll(`[data-id]`);

    return [...categoriesWrappers].reduce((accum, category) => {
      accum[category.dataset.id] = category;
      return accum;
    }, {});
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements;

    this.categories = await this.getCategories();
    this.renderCategories(this.categories);

    this.addEventListeners();

    return this.element;
  }

  async getCategories() {
    const url = new URL(`${DATA_API}/categories`, BACKEND_URL);
    url.searchParams.set(`_sort`, `weight`);
    url.searchParams.set(`_refs`, `subcategory`);

    return fetchJson(url.href);
  }

  renderCategories(categories) {
    const { categoriesContainer } = this.subElements;
   
    categoriesContainer.innerHTML = categories
      .map(({ id, title }) => {
        return `
          <div class="category category_open" data-id="${id}">
            <header class="category__header">
              ${title}
            </header>
            <div class="category__body">
              <div class="subcategory-list"></div>
            </div>
          </div>
        `;
      })
      .join('');

    this.addSubcategories(categories);
  }

  addSubcategories(categories) {
    const categoriesWrappers = this.getCategoriesWrappers;
    
    categories.forEach(({ id, subcategories }) => {
      const sortableList = new SortableList({
        items: subcategories.map(this.renderSubcategoryItem)
      });

      categoriesWrappers[id]
        .querySelector('.subcategory-list')
        .append(sortableList.element);
    });
  }

  renderSubcategoryItem({ id, title, count }) {
    const element = document.createElement('div');

    element.innerHTML = `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${id}">
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>
    `;

    return element.firstElementChild;
  }

  addEventListeners() {
    const { categoriesContainer } = this.subElements;

    categoriesContainer.addEventListener('sortable-list-reorder', this.onSortableListReorder);

    document.addEventListener('pointerdown', this.onPointerDown);
  }

  renderNotification(message, type = 'success') {
    const notification = new NotificationMessage(message, {
      duration: 2000,
      type
    });
    notification.show();
  }

  removeEventListeners() {
    document.removeEventListener('pointerdown', this.onPointerDown);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    this.removeEventListeners();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}