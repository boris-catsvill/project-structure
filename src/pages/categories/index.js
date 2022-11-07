import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';
import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  data = [];
  url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', process.env.BACKEND_URL);

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Product categories</h1>
        </div>
        <p>Subcategories can be dragged and dropped to change their order within their category.</p>
        <div data-element="categoriesContainer">
        </div>
      </div>
    `;
  }

  getCategories() {
    for (const category of this.data) {
      const categoryContainer = document.createElement('div');
      categoryContainer.className = 'category'
      categoryContainer.classList.add('category_open');
      categoryContainer.dataset.id = `${category.id}`
      categoryContainer.innerHTML = `<header class="category__header">${category.title}</header>`;
      categoryContainer.append(this.getCategoriesList(category));

      this.subElements.categoriesContainer.append(categoryContainer);
    }
  }

  getCategoriesList(category) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <div class="category__body">
        <div class="subcategory-list"></div>
      <div>
    `;

    const categoriesBody = wrapper.firstElementChild;

    const items = category.subcategories.map(({ id, title, count }) => this.getCategoriesItem(id, title, count));

    const sortableList = new SortableList({items});

    const categoriesList = categoriesBody.querySelector('.subcategory-list');
    categoriesList.append(sortableList.element);

    return categoriesBody;
  }

  getCategoriesItem(id, title, count) {  
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id=${id}>
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>
    `;

    return wrapper.firstElementChild;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll(`[data-element]`);

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  async render() {
    this.data = await fetchJson(this.url);

    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.getCategories();
    this.initEventListeners();
    
    return this.element;
  }

  onCategoryToggle = (event) => {
    if (event.target.closest('.category__header')) {
      const element = event.target.closest('.category__header').parentNode;
      element.classList.toggle('category_open');
    }
  }

  onOrderChange = (event) => {
    const subcategories = [...event.target.children];

    const data = subcategories.map((value, index) => {
      return {
          id: value.dataset.id,
          weight: index + 1
      };
    });
    
    this.save(data);
  }

  async save(data) {
    try {
      await fetchJson(new URL('api/rest/subcategories', process.env.BACKEND_URL), {
          method: 'PATCH',
          body: JSON.stringify(data),
          headers: {
              'Content-type': 'application/json'
          }
      });
      this.showNotification({
        type: 'success',
        text: 'Order was saved'
      })

    } catch (error) {
      this.showNotification({
        type: 'error',
        text: `Error: ${error}`
      })
    }
  }

  showNotification(message) {
    const notification = new NotificationMessage(message.text, {
      duration: 2000,
      type: message.type
    });

    notification.show();
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onCategoryToggle);

    this.subElements.categoriesContainer.addEventListener('sortable-list-reorder', this.onOrderChange);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.components = {};
  }

}