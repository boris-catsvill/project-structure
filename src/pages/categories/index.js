import Category from '../../components/categories/index.js';
import fetchJson from '../../utils/fetch-json.js';
import NotificationMessage from '../../components/notification/index.js';
const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  subElements = {};
  url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    const categories = await this.loadData();
    this.renderCategories(categories);
    this.initEventListeners();
    return this.element;
  }

  getTemplate() {
    return `
    <div class = "categories">
      <div class = "content__top-panel">
      <h1 class = "page-title">Категории товаров</h1>
      </div>
      <p>Подкатегории можно перетаскивать, меняя их порядок внутри
      своей категории.</p>
      <div data-element = "categoriesContainer"></div>
    </div>
    `;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, elem) => {
      acc[elem.dataset.element] = elem;
      return acc;
    }, {});
  }

  loadData() {
    return fetchJson(`${this.url}`);
  }

  renderCategories(categories) {
    const { categoriesContainer } = this.subElements;
    categories.map(category => {
      categoriesContainer.append(new Category(category).element);
    });
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
    this.element.addEventListener('sortable-list-reorder', this.sendReorderedData);
  }

  sendReorderedData = async event => {
    const url = new URL('api/rest/subcategories', BACKEND_URL);
    const { detail } = event;
    console.log(event);
    try {
      const result = await fetchJson(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(detail)
      });
      if (result) {
        new NotificationMessage('Порядок категорий сохранен', {
          duration: 3000,
          type: 'success'
        }).show();
      }
    } catch (error) {
      new NotificationMessage('Ошибка', { duration: 3000, type: 'error' }).show();
      console.log('Ошибка при отправке данных на сервер', error);
    }
  };

  onPointerDown = event => {
    const header = event.target.closest('.category__header');
    if (header) {
      const category = header.closest('.category');
      category.classList.toggle('category_open');
    }
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
