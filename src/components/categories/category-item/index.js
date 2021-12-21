import SortableList from '../../sortable-list';
import FetchJSON from '../../../utils/fetch-json';

export default class CategoryItem {
  element;
  category = {}
  subElements = {}
  sortableList;

  handleReorder = async () => {
    const { subcategories } = this.category;
    const subcategoryIds = this.subElements.sortableList.querySelectorAll('[data-id]');
    const currentOrder = [...subcategoryIds].map(el => el.dataset.id);
    subcategories.forEach(subcategory => {
      subcategory.weight = currentOrder.indexOf(subcategory.id) + 1;
    })

    this.category.subcategories = subcategories.sort((a,b) => a.weight - b.weight);
    const url = new URL('api/rest/subcategories', process.env.BACKEND_URL);
    const params = {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(this.category.subcategories),
    }

    await FetchJSON(url, params);
  }

  constructor({ category = {} }) {
    this.category = category;
    this.render();
  }

  initList() {
    const { subcategories } = this.category;
    const items = subcategories.map( subcategory => {
      const { id, title, count} = subcategory;
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
            data-id="${id}">
          <strong>${title}</strong>
          <span><b>${count}</b> products</span>
        </li>`

      return wrap.firstElementChild;
    })
    this.sortableList = new SortableList({items});
    this.subElements.sortableList.append(this.sortableList.element);
  }

  initEventListeners() {
    this.element.addEventListener('click', event => {
      const header = event.target.closest('.category__header');
      if (header) {
        this.element.classList.toggle('category_open')
      }
    })
    this.element.addEventListener('sortable-list-reorder', this.handleReorder);
  }

  render() {
    const { title, id } = this.category;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="category category_open" data-id="${id}">
        <header class="category__header">
          ${title}
        </header>
        <div class="category__body">
          <div class="subcategory-list" data-element="sortableList"></div>
        </div>
      </div>
    `
    this.element = wrap.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initList();
    this.initEventListeners();
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

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
    this.element.remove();
    this.element = null;
    this.sortableList.destroy();
    this.category = {}
    this.subElements = {}
  }
}
