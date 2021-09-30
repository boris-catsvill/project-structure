import SortableList from '../../components/sortable-list/index.js';
import Notification from '../../components/notification/index.js';
import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element = null;
  subElements = {};

  toggleCategoryDropdown = event => {
    if (event.target.classList.contains('category__header')) {
      event.target.parentElement.classList.toggle('category_open');
    }
  };

  onOrderChange = event => {
    this.showNotification('success', 'Category order saved');
    this.updateCategoryOrder(event.target);
  };

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const data = await this.loadData();

    this.renderComponents(data);
    this.initEventListeners();

    return this.element;
  }

  async loadData() {
    const url = new URL('api/rest/categories', BACKEND_URL);

    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url.href);
  }

  renderComponents(data) {
    this.subElements.categoriesContainer.append(...this.renderCategories(data));
  }

  renderCategories(categories) {
    return categories.map(category => {
      const categoryElement = this.getCategoryElement(category);

      const listWrapper = categoryElement.querySelector('[data-subcategory-list]');
      listWrapper.append(this.renderSubCategories(category));

      return categoryElement;
    });
  }

  getCategoryElement(category) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getCategoryTemplate(category);

    return wrapper.firstElementChild;
  }

  renderSubCategories(category) {
    const sortableList = new SortableList({
      items: category.subcategories.map(subCategory => {
        const element = document.createElement('li');

        element.classList.add('categories__sortable-list-item', 'sortable-list__item');
        element.dataset.grabHandle = '';
        element.dataset.id = subCategory.id;
        element.innerHTML = `<strong>${subCategory.title}</strong>
                               <span><b>${subCategory.count}</b> products</span>`;

        return element;
      })
    });

    return sortableList.element;
  }

  get template() {
    return `
        <div class="categories">
          <div class="content__top-panel">
            <h1 class="page-title">Categories</h1>
          </div>
          <div data-element="categoriesContainer"></div>
        </div>`;
  }

  getCategoryTemplate(category) {
    return `
        <div class="category category_open" data-id="${category.id}">
          <header class="category__header">
            ${category.title}
          </header>
          <div class="category__body">
            <div class="subcategory-list" data-subcategory-list></div>
          </div>
        </div>`;
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.toggleCategoryDropdown);
    document.addEventListener('sortable-list-reorder', this.onOrderChange);
  }

  showNotification(type, message) {
    const notification = new Notification(message, {
      duration: 3000,
      type: type
    });

    notification.show();
  }

  updateCategoryOrder(categoriesList) {
    const newOrder = [];
    const url = new URL('api/rest/subcategories', BACKEND_URL);

    [...categoriesList.children].forEach((listItem, index) => {
      newOrder.push({
        id: listItem.dataset.id,
        weight: index + 1
      });
    });

    const params = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(newOrder)
    };

    fetchJson(url, params);
  }

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');

    return [...subElements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;

    document.removeEventListener('pointerdown', this.toggleCategoryDropdown);
    document.removeEventListener('sortable-list-reorder', this.onOrderChange);
  }
}
