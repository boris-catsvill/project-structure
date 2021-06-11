/* eslint-disable no-undef */
import fetchJson from '../../utils/fetch-json.js';
import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';

export default class Page {
  categories = [];

  element;
  subElements = {};

  onCategoryClick = event => {
    if (event.target.classList.contains('category__header')) {
      const categoryElement = event.target.closest('.category');
      const openedCategoryClass = 'category_open';

      if (categoryElement.classList.contains(openedCategoryClass)) {
        categoryElement.classList.remove(openedCategoryClass);
      } else {
        categoryElement.classList.add(openedCategoryClass);
      }
    }
  };

  onItemsReorder = async ({ target }) => {
    const category = target.closest('.category');
    const subcategories = category.querySelectorAll('.sortable-list__item');

    const requestBody = [];
    for (let i = 0; i < subcategories.length; i++) {
      requestBody.push({ id: subcategories[i].dataset.id, weight: i + 1 });
    }

    try {
      const url = new URL('api/rest/subcategories', process.env.BACKEND_URL);
      await fetchJson(url, {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: {
          'content-type': 'application/json'
        }
      });
      new NotificationMessage('Порядок категорий сохранён');
    } catch (error) {
      new NotificationMessage(`Ошибка сети: ${error}`, { type: 'error' });
    }
  };

  get template() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-elem="categoriesContainer"></div>
      </div>
    `;
  }

  getCategoryTemplate({ id, title }) {
    return `
      <div class="category category_open" data-id="${id}">
        <header class="category__header">${title}</header>
        <div class="category__body">
          <div class="subcategory-list"></div>
        </div>
      </div>
    `;
  }

  getSubCategoryTemplate({ id, title, count }) {
    return `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${id}">
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>
    `;
  }

  getCategories() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return fetchJson(url);
  }

  async render() {
    this.categories = await this.getCategories();
    this.element = this.getElementFromTemplate(this.template);
    this.subElements = this.getSubElements();

    this.renderCategories();
    this.initEventListeners();
    return this.element;
  }

  renderCategories() {
    this.categories.forEach(categoryData => {
      const category = this.getElementFromTemplate(this.getCategoryTemplate(categoryData));
      const subcategories = categoryData['subcategories'].map(subCategory => this.getElementFromTemplate(this.getSubCategoryTemplate(subCategory)));

      category.querySelector('.subcategory-list').append(new SortableList({ items: subcategories }).element);
      this.subElements['categoriesContainer'].append(category);
    });
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  initEventListeners() {
    const categoriesContainer = this.subElements['categoriesContainer'];
    categoriesContainer.addEventListener('pointerdown', this.onCategoryClick);
    categoriesContainer.addEventListener(SortableList.reorderedEventName, this.onItemsReorder);
  }

  getSubElements(element = this.element) {
    const result = {};
    const elements = element.querySelectorAll('[data-elem]');

    for (const subElement of elements) {
      const name = subElement.dataset.elem;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
