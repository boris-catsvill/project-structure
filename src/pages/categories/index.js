import NotificationMessage from '../../components/notification/index.js';
import CategoriesContainer from '../../components/categories/index.js';

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  evntSignal = new AbortController();

  constructor(match = [], url = '/api/rest/categories', queryParams = {}) {
    this.url = new URL(url, process.env.BACKEND_URL);
    this.urlDataUpdate = new URL('/api/rest/subcategories', process.env.BACKEND_URL);
    this.queryParams = queryParams;
  }

  onSubcatReorder = event => {
    const restData = event.detail.map(item => {
      return { id: item.id, weight: item.order };
    });
    this.submitChanges(restData);
    const notification = new NotificationMessage('Category order saved');
    notification.show();
  };

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    await this.initComponents();
    this.renderComponents();
    this.initEventListeners();
    return this.element;
  }

  async initComponents() {
    const data = await this.loadData();
    const catArray = data.map(item => {
      return { id: item.id, title: item.title, itemList: item.subcategories };
    });
    const categoriesContainer = new CategoriesContainer(catArray);
    this.components = {
      categoriesContainer
    };
  }

  loadData() {
    const url = new URL(this.url.href);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    for (const parName in this.queryParams) {
      url.searchParams.set(parName, this.queryParams[parName]);
    }
    return fetchJson(url);
  }

  submitChanges(restData) {
    const url = this.urlDataUpdate;
    fetchJson(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(restData)
    });
  }

  get template() {
    return `<div class="categories">
      <div class="content__top-panel">
        <h2 class="page-title">Категории товаров</h2>
      </div>
      <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
      <div data-element="categoriesContainer">
        <!-- categories component list -->
      </div>
    </div>`;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
      root.append(element);
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  initEventListeners() {
    const { signal } = this.evntSignal;
    this.components.categoriesContainer.element.addEventListener(
      'subcategory-reorder',
      event => this.onSubcatReorder(event),
      { signal }
    );
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    if (this.evntSignal) {
      this.evntSignal.abort();
    }
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
