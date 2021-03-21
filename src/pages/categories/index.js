import Categories from '../../components/categories';
import NotificationMessage from '../../components/notification';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  get template() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-element="categoriesContainer"></div>
      </div>
    `;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    await this.initComponents();
    this.renderComponents();
    this.initEventListners();

    return this.element;
  }

  async initComponents() {
    const data = await this.loadCategories();
    const categoriesContainer = new Categories(data);

    this.components = {
      categoriesContainer,
    };
  }

  loadCategories() {
    const url = new URL('/api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return fetchJson(url);
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListners() {
    const notification = new NotificationMessage('Порядок изменен', { duration: 2000, type: 'success' });
    this.element.addEventListener('sortable-list-reorder', event => {
      notification.show();
    })
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.remove();

    this.element = null;
    this.subElements = null;
    this.components = null;
  }
}
