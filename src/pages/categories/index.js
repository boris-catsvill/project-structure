import Category from '../../components/categories/index.js';
import fetchJson from '../../utils/fetch-json.js';
import NotificationMessage from '../../components/notification/index.js';

export default class Page {
  element;
  subElements;
  components;
  categories;

  onSaveReorder = (event) => {
    const msg = event.detail.success ? 'Category order saved' : 'Unable to save category order';
    const msgtype = event.detail.success ? 'success' : 'error';
    const notification = new NotificationMessage(msg, {type: msgtype});
    notification.show(this.element);
  }

  onCategoryHeaderClick = (event) => {
    const categoryHeader = event.target.closest('.category__header');
    if(!categoryHeader) return;

    categoryHeader.parentElement.classList.toggle('category_open');
  }

  constructor() {
    this.categoriesEndPoint = 'api/rest/categories';
  }

  get template() {
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
    const urlCategories = new URL(this.categoriesEndPoint, process.env.BACKEND_URL);
    urlCategories.searchParams.set('_sort', 'weight');
    urlCategories.searchParams.set('_refs', 'subcategory');

    try {
      const categories =  await fetchJson(urlCategories);
      return categories;
    } catch(error) {
      throw new Error(`Unable to fetch data from ${urlCategories}. Error: ${error}`);
    }
  }

  addComponents() {
    this.components = this.categories.map(category => new Category(category));
    this.components.map(categoryElement => this.subElements.categoriesContainer.append(categoryElement.element));
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.categories = await this.loadCategories();

    this.addComponents();
    this.initEventListeners();
    
    return this.element;
  }

  initEventListeners() {
    this.element.addEventListener('save-reorder', this.onSaveReorder);
    this.element.addEventListener('pointerdown', this.onCategoryHeaderClick);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.onCategoryHeaderClick);

    this.components.map(component => component.destroy());
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}