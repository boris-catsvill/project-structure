import fetchJson from '../../utils/fetch-json.js';
import NotificationMessage from '../../components/notification/index.js';
import Categories from '../../components/categories/index.js';

export default class Page {
  element;
  subElements;
  components;
  categories;
  url = new URL('api/rest/subcategories', process.env.BACKEND_URL);

  saveReorder = event => {
    const message = event.detail.success ? 'Categories order saved' : 'Error saving';
    const type = event.detail.success ? 'success' : 'error';
    const notification = new NotificationMessage(message, {
      duration: 2000,
      type: `notification_${type} show`
    });
    notification.show(this.element);
  };

  getTemplate() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
      <div data-element="categoriesContainer">
      </div>
    </div>
    `;
  }

  async loadCategories() {
    const urlCategories = new URL('api/rest/categories', process.env.BACKEND_URL);
    urlCategories.searchParams.set('_sort', 'weight');
    urlCategories.searchParams.set('_refs', 'subcategory');

    try {
      return await fetchJson(urlCategories);
    } catch (error) {
      throw new Error(`Unable to fetch data from ${urlCategories}. Error: ${error}`);
    }
  }
  createComponents() {
    this.components = this.categories.map(category => new Categories(category));
  }
  renderComponents() {
    this.components.forEach(category =>
      this.subElements.categoriesContainer.append(category.render())
    );
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.categories = await this.loadCategories();
    this.createComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.element.addEventListener('save-reorder', this.saveReorder);
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }
    return subElements;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Object.values(this.components).forEach(item => item.destroy());
    this.components = {};
    this.subElements = {};
    this.element = null;
  }
}
