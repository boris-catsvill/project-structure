import SortableList from '../../components/sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';

export default class Category {
  element;
  subElements;

  onReorder = async() =>{
    try {
      await fetchJson(this.url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: this.getContentBodyToSaveOrder()
      });
      this.subcategoriesSaved(true);
    } catch(error) {
      this.subcategoriesSaved(false);
      throw new Error(`Unable to save new subcategories order to ${this.url}. Error: ${error}`);
    }
  }

  constructor({id, title, count, subcategories, weight} = {}) {
    this.id = id;
    this.title = title;
    this.count = count;
    this.subcategories = subcategories;
    this.weight = weight;
    this.url = new URL('api/rest/subcategories', process.env.BACKEND_URL);
  }

  get template() {
    return `
    <div class="category category_open" data-id=${this.id}>
      <header class="category__header">
        ${this.title}
      </header>
      <div class="category__body">
        <div data-element="listContainer" class="subcategory-list">
        </div>
      </div>
    </div>
    `;
  }

  subcategoryTemplate({id, title, count}) {
    return `
    <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id=${id}>
      <strong>${title}</strong>
      <span><b>${count}</b> products</span>
    </li>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
    this.sortableList = new SortableList({items: this.subcategories
        .map(subcategory => this.subcategoryTemplate({ ...subcategory }))});

    this.subElements.listContainer.append(this.sortableList.element);

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.subElements.listContainer.addEventListener('sortable-list-reorder', this.onReorder);
  }

  getContentBodyToSaveOrder() {
    const result = [];
    let weightCounter = 1;
    for(const subcategory of this.sortableList.element.children) {
      const foundSubcategory = this.subcategories.find(item => item.id === subcategory.dataset.id);
      result.push({category: this.id, count: foundSubcategory.count, id: foundSubcategory.id,
         title: foundSubcategory.title, weight: weightCounter++});
    }

    return JSON.stringify(result);
  }

  subcategoriesSaved(isSaved) {
    this.element.dispatchEvent(new CustomEvent('save-reorder', {
      bubbles: true,
      detail: {
        success: isSaved
      }
    }));
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
    this.subElements.listContainer.removeEventListener('sortable-list-reorder', this.onReorder);

    this.sortableList.destroy();
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}
