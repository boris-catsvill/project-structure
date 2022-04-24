import fetchJson from '../../utils/fetch-json';

export default class Page {
  subElements = {};
  components = {};
  url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', process.env.BACKEND_URL);

  get template() {
    return `
    <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element="categoriesContainer"></div>
      </div>
    `;
  }

  getCategories(data) {
    return data.map(category => this.getCategory(category)).join('');
  }

  getCategory({ title, subcategories }) {
    return `
      <div class="category category_open" data-id="bytovaya-texnika">
        <header class="category__header">${title}</header>
        <div class="category__body">
          <div class="subcategory-list">
            <ul class="sortable-list">
             ${subcategories.map(subcategory => this.getSubcategory(subcategory)).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  getSubcategory({ title, count }) {
    return `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="tovary-dlya-kuxni">
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>
    `;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    const data = await fetchJson(this.url);
    this.update(data);

    this.initEventListeners();

    return this.element;
  }

  update(data) {
    this.subElements.categoriesContainer.innerHTML = this.getCategories(data);
  }

  initEventListeners() {
    this.subElements.categoriesContainer.addEventListener('pointerdown', event => {
      const container = event.target.closest('.category');

      if (container) {
        container.classList.toggle('category_open');
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
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
    this.subElements = {};

    for (const component in this.components) {
      this.components[component].destroy();
    }

    this.components = {};
  }
}
