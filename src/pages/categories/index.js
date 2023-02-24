import fetchJson from '../../utils/fetch-json.js';
import escapeHtml from '../../utils/escape-html.js';
import SortableList from '../../components/sortable-list/index.js';

const CAT_API_URL = 'api/rest/categories';
const BACKEND_URL = 'https://course-js.javascript.ru';
// https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory
export default class Page {
  element = {};
  subcatElements = {};
  subcatLists = {};
  categories = [];
  controller = new AbortController();

  async render() {
    this.categories = await this.loadCategories();

    const wrap = document.createElement('div');
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;

    this.getSubCatElements();
    this.initSubcategoriesLists();
    this.appendSubcategoriesLists();

    return this.element;
  }

  async loadCategories() {
    const query = new URL(CAT_API_URL, BACKEND_URL);
    query.searchParams.set('_sort', 'weight');
    query.searchParams.set('_refs', 'subcategory');

    return await fetchJson(query);
  }

  initListeners() {
    document.addEventListener('date-select', this.rangeChanged, {
      signal: this.controller.signal
    });
  }

  getSubCatElements() {
    for (const item of this.element.querySelectorAll('[data-parentid]')) {
      this.subcatElements[item.dataset.parentid] = item;
    }
  }

  initSubcategoriesLists() {
    this.categories.forEach(({ subcategories, id }) => {
      const items = subcategories
        ? subcategories.map(item => this.getSubcategoryElement(item))
        : [];
      this.subcatLists[id] = new SortableList({ items });
    });
  }
  appendSubcategoriesLists() {
    for (const [key, value] of Object.entries(this.subcatElements)) {
      value.append(this.subcatLists[key].element);
    }
  }

  //   renderImages() {
  //     const items = Object.hasOwn(this.product, 'images')
  //       ? this.product.images.map(photo => {
  //           return this.getPhotoTemplate(photo);
  //         })
  //       : [];

  //     if (Object.hasOwn(this.sortableImageList, 'destroy')) {
  //       this.sortableImageList.destroy();
  //     }

  //     this.sortableImageList = new SortableList({ items });
  //     this.subElements.imageListContainer.innerHTML = '';
  //     this.subElements.imageListContainer.append(this.sortableImageList.element);
  //   }

  getTemplate() {
    return `    <div class="categories">
    <div class="content__top-panel">
      <h1 class="page-title">Категории товаров</h1>
    </div>
        <div data-elem="categoriesContainer">
            ${this.getCategoriesTemplate()}
        </div>
    </div>`;
  }

  getCategoriesTemplate() {
    return this.categories
      .map(cat => {
        return this.getCategoryTemplate(cat);
      })
      .join('');
  }
  getCategoryTemplate(cat) {
    return `<div class="category category_open" data-id="${cat.id}">
    <header class="category__header">
      ${cat.title}
    </header>
    <div class="category__body">
      <div class="subcategory-list"  data-parentid="${cat.id}">
      <!-- append subCatComponent-->
      </div>
    </div>
  </div>`;
  }
  getSubcategoryElement(item) {
    const element = document.createElement('div');
    element.innerHTML = `<li class="categories__sortable-list-item" data-grab-handle="" data-id="${
      item.id
    }">
        <strong>${item.title}</strong>
        <span><b>${item.count}</b> product${item.count > 1 ? 's' : ''}</span>
      </li>`;
    return element.firstElementChild;
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
    this.controller.abort();
  }
}
