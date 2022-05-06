import SortableList from '../../components/sortable-list';
import fetchJson from "../../utils/fetch-json";

export default class Category {
  constructor(data) {
    this.data = data;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.sortableList = new SortableList({ items: this.renderSubcategories() });
    const listContainer = wrapper.querySelector('.subcategory-list');
    listContainer.append(this.sortableList.element);
    this.element = wrapper.firstElementChild;

    this.addEventListeners();

    return this.element;
  }

  renderSubcategories() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.data.subcategories.map(subcategory => {
      return `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${subcategory.id}">
          <strong>${subcategory.title}</strong>
          <span><b>${subcategory.count}</b> products</span>
        </li>
        `;
    }).join('');
    return wrapper.children;
  }

  getTemplate() {
    return `
      <div class="category category_open" data-id="${this.data.id}">
        <header class="category__header">
          ${this.data.title}
        </header>
        <div class="category__body">
          <div class="subcategory-list"></div>
        </div>
      </div>
    `;
  }

  addEventListeners() {
    this.element.addEventListener('sortable-list-reorder', event => this.onSortableListReorder(event));
    this.element.addEventListener('click', event => this.onCategoryHeaderCkick(event));
  }

  onCategoryHeaderCkick(event) {
    const header = event.target.closest('.category__header');
    if (!header) {
      return;
    }
    header.parentElement.classList.toggle('category_open');
  }

  onSortableListReorder(event) {
    const items = event.target.querySelectorAll('[data-id]');
    if (!items) {
      return;
    }
    let weight = 1;
    const data = [...items].map(item => ({id: item.dataset.id, weight: weight++}));
    const url = new URL('api/rest/subcategories', process.env.BACKEND_URL);
    fetchJson(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }

  destroy() {
    if (this.sortableList) {
      this.sortableList.destroy();
    }
    this.sortableList = null;
    this.remove();
  }
}