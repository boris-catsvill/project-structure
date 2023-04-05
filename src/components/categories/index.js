import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';

export default class CategoriesContainer {
  element;
  subElements = {};
  eventController = new AbortController();

  constructor(list = [{ id: '', title: '', itemList: [] }]) {
    this.list = list;
    this.render();
  }

  onPointerDown = event => {
    if (event.button !== 0) {
      return false;
    }
    event.preventDefault();
    const categBlock = event.target.closest('[data-id]');
    if (categBlock) {
      categBlock.classList.toggle('category_open');
    }
  };

  onSubcatReorder = event => {
    const elements = event.target.querySelectorAll('[data-id]');
    const itemOrder = [...elements].map((element, order) => ({
      id: element.dataset.id,
      order: order
    }));
    this.element.dispatchEvent(
      new CustomEvent('subcategory-reorder', {
        bubbles: true,
        detail: itemOrder
      })
    );
    return false;
  };

  render() {
    this.renderComponent();
    this.subElements = this.getSubelements();
    this.initEventListeners();
  }

  renderComponent() {
    this.element = document.createElement('div');
    for (const catItem of this.list) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getTemplate(catItem.id, catItem.title);
      const element = wrapper.firstElementChild;
      const body = element.querySelector('.subcategory-list');
      this.addListElements(catItem.itemList, body);
      this.element.append(element);
    }
  }

  addListElements(itemList, parent) {
    const catSection = itemList.map(item => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getItemTemplate(
        item.id,
        item.title,
        `<b>${item.count}</b> products`
      );
      return wrapper.firstElementChild;
    });
    const sortableList = new SortableList({ items: catSection });
    parent.append(sortableList.element);
  }

  getSubelements() {
    const headers = this.element.querySelectorAll('.category__header');
    return [...headers].reduce((accum, subElement) => {
      accum['category_' + subElement.dataset.id] = subElement;
      return accum;
    }, {});
  }

  getTemplate(id, title) {
    return `
       <div class="category category_open" data-id="${id}">
       <header class="category__header"> ${title} </header>
         <div class="category__body">
             <div class="subcategory-list"></div>
         </div>
       </div>`;
  }

  getItemTemplate(id, name, number_str) {
    return `
       <li class="categories__sortable-list-item " data-grab-handle=""
          data-id="${id}">
         <strong>${escapeHtml(name)}</strong>
         <span>${number_str}</span>
       </li>`;
  }

  initEventListeners() {
    const { signal } = this.eventController;
    const header = this.element.querySelector('.category__header');
    header.addEventListener('pointerdown', event => this.onPointerDown(event), { signal });
    this.element.addEventListener('sortable-list-reorder', event => this.onSubcatReorder(event), {
      signal
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    if (this.eventController) {
      this.eventController.abort();
    }
    this.remove();
    this.element = null;
  }
}
