import SortableList from "../../components/sortable-list/index.js";
import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class CategoriesPage {
  model = [];
  components = [];
  abortController = new AbortController();
  pageComponents = [];
  subElements = [];

  async render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();

    await this.getData();
    this.renderPageElements();
    this.addEventListeners();
    return this.element;
  }

  addEventListeners() {
    const {categoriesContainer} = this.subElements;
    categoriesContainer.addEventListener(
      'pointerdown',
      this.onCategoryClick,
      this.abortController.signal
    );

  }

  async getData() {
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    this.model = await fetchJson(url);
  }

  renderPageElements() {
    const {categoriesContainer} = this.subElements;
    for (const data of this.model) {
      let categoryElement = this.getCategoryElement(data);
      const catElements = data.subcategories
        .map(catData => this.renderCategoryListElement(catData));
      const sortableList = new SortableList({items: catElements});
      sortableList.element.addEventListener(
        'sortable-list-reorder',
        this.onCategoryReorder,
        this.abortController.signal
      );
      this.components.push(sortableList);
      categoryElement.querySelector('.subcategory-list').append(sortableList.element);
      categoriesContainer.append(categoryElement)
    }
  }

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element="categoriesContainer">
        </div>
      </div>
    `;
  }

  renderCategoryListElement(data) {
    const div = document.createElement('div');
    div.innerHTML = `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${data.id}">
        <strong>${data.title}</strong>
        <span><b>${data.count}</b> products</span>
      </li>
    `;
    return div.firstElementChild;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");
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
    this.subElements = null;
    this.abortController.abort();
    this.components.forEach(value => value.destroy());
    this.components = null;
  }

  getCategoryElement(data) {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="category category_open" data-id="${data.id}">
        <header class="category__header">
            ${data.title}
        </header>
        <div class="category__body">
          <div class="subcategory-list"/div>
        </div>
      </div>
    `;
    return div.firstElementChild;
  }

  onCategoryClick = (event) => {
    const target = event.target.closest('div');
    if (!target && target.classList.contains('categories')) {
      return;
    }
    target.classList.toggle('category_open');
  }

  onCategoryReorder = (event) => {
    const categoryElement = event.target;
    const body = [];
    const children = categoryElement.children;
    for (let i = 0; i < children.length; i++) {
      const li = children[i];
      body.push({
        id: li.dataset.id,
        weight: i + 1
      })
    }
    fetchJson(BACKEND_URL + '/api/rest/subcategories',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(body),
        signal: this.abortController.signal
      }
    )
  }
}
