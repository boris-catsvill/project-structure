import SortableList from '../sortable-list';
import FetchJSON from '../../utils/fetch-json';
import NotificationMessage from '../notification';

export default class CategoriesList {
  category = {};
  subElements = {};
  sortableList;

  constructor({ category = {} }) {
    this.category = category;
    this.render();
  }

  getTemplate() {
    const { title, id } = this.category;
    return `
      <div class="category category_open" data-id="${id}">
        <header class="category__header">
          ${title}
        </header>
        <div class="category__body">
          <div class="subcategory-list" data-element="sortableList"></div>
        </div>
      </div>
    `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.createSortableList();
    this.attachEventListeners();
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  createSortableList() {
    const { subcategories } = this.category;
    const items = subcategories.map(subcategory => {
      const { id, title, count } = subcategory;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <li class='categories__sortable-list-item sortable-list__item' data-grab-handle
            data-id='${id}'>
          <strong>${title}</strong>
          <span><b>${count}</b> products</span>
        </li>`;
      return wrapper.firstElementChild;
    });
    this.sortableList = new SortableList({
      items
    });
    this.subElements.sortableList.append(this.sortableList.element);
  }

  reorderHandler = async () => {
    const { subcategories } = this.category;
    const placementShift = 1;
    const subcategoryIds = this.subElements.sortableList.querySelectorAll('[data-id]');
    const currentOrder = [...subcategoryIds].map(elem => elem.dataset.id);
    subcategories.forEach(subcategory => {
      subcategory.weight = currentOrder.indexOf(subcategory.id) + placementShift;
    });
    this.category.subcategories = subcategories.sort((a, b) => a.weight - b.weight);
    const url = new URL('api/rest/subcategories', process.env.BACKEND_URL);
    const params = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.category.subcategories)
    };
    await FetchJSON(url, params);
    const notificationMessage = new NotificationMessage('Order Saved', {
      duration: 5000,
      type: 'success'
    });
    notificationMessage.show();
  };

  attachEventListeners() {
    this.element.addEventListener('click', event => {
      const header = event.target.closest('.category__header');
      if (header) this.element.classList.toggle('category_open');
    })
    this.sortableList.element.addEventListener('sortable-list-reorder', this.reorderHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.category = null;
    this.subElements = null;
  }
}
