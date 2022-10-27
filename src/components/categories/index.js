import SortableList from '../../components/sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';

export default class Categories {
  element;
  subElements;

  constructor({ id, title, count, subcategories, weight } = {}) {
    this.id = id;
    this.title = title;
    this.count = count;
    this.subcategories = subcategories;
    this.weight = weight;
    this.url = new URL('api/rest/subcategories', process.env.BACKEND_URL);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.sortableList = new SortableList({
      items: this.subcategories.map(subcategory => this.getSubTemplate({ ...subcategory }))
    });

    this.subElements.listContainer.append(this.sortableList.element);
    this.initEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
    <div class="category category_open" data-id=${this.id}>
      <header  class="category__header">
        ${this.title}
      </header>
      <div class="category__body">
        <div data-element="listContainer" class="subcategory-list">
        </div>
      </div>
    </div>
    `;
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.headerClick);
    this.subElements.listContainer.addEventListener('sortable-list-reorder', this.swapCategories);
  }

  headerClick = event => {
    const check = event.target.closest('.category__header');
    if (!check) return;
    this.element.classList.toggle('category_open');
  };

  swapCategories = async () => {
    if (JSON.stringify(this.subcategories) === this.getSaveOrder()) return;
    try {
      await fetchJson(this.url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: this.getSaveOrder()
      });
      this.subcategoriesSaved(true);
    } catch (error) {
      this.subcategoriesSaved(false);
      throw new Error(`Unable to save new subcategories order to ${this.url}. Error: ${error}`);
    }
  };

  getSubTemplate({ id, title, count }) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="categories__sortable-list-item" data-id="${id}" data-grab-handle style>
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>
    `;

    return wrapper.firstElementChild;
  }

  getSaveOrder() {
    const result = [];
    let counter = 1;
    Object.values(this.sortableList.element.children).forEach(subCategory => {
      const findSub = this.subcategories.find(item => item.id === subCategory.dataset.id);
      result.push({
        id: findSub.id,
        title: findSub.title,
        count: findSub.count,
        category: this.id,
        weight: counter++
      });
    });

    return JSON.stringify(result);
  }

  subcategoriesSaved(isSaved) {
    this.element.dispatchEvent(
      new CustomEvent('save-reorder', {
        bubbles: true,
        detail: {
          success: isSaved
        }
      })
    );
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
    this.subElements = null;
    this.element = null;
  }
}
