import NotificationMessage from '../../components/notification';
import CategorySection from '../../components/category-section';
import fetchJson from '../../utils/fetch-json';

export default class Page {
  subElements;
  categories;
  message;

  constructor() {
    this.render();
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-elem]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});
  }

  renderCategorySections(data) {
    const categorySections = data.map((category) => {
      const categorySection = new CategorySection(category);
      return categorySection.element;
    });
    categorySections.forEach((categorySection) => {
      this.subElements.categoriesContainer.append(categorySection);
    })
  }

  initEventListeners() {
    this.element.addEventListener('sortable-list-reorder', () => {
      this.message = new NotificationMessage('Category order saved', { duration: 1500, type: 'notification_success'});
      this.message.show();
    });
  }

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-elem="categoriesContainer"></div>
      </div>
    `;
  }

  async loadData() {
    const url = new URL('/api/rest/categories', process.env.BACKEND_URL);

    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url);
  }

  initComponents() {
    this.message = new NotificationMessage('Category order saved', { duration: 1500, type: 'notification_success show'});
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const data = await this.loadData();

    this.renderCategorySections(data);

    this.initEventListeners();

    return this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
  }

}
