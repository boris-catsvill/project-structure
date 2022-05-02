import SortableList from '../../components/sortable-list/index.js';
import fetchJson from "../../utils/fetch-json";

export default class Category {
  element;
  sortableList;
  listItems;

  reorder = async (event) => {
    let container = this.category.subcategories;
    let first = event.detail.from;
    let last = event.detail.to;

    if (last >= container.length) {
      last = container.length - 1;
    }

    container[first].weight = last + 1;

    for (let i = first + 1; i <= last; ++i) {
      container[i].weight--;
    }

    for (let i = last; i < first; ++i) {
      container[i].weight++;
    }

    this.category.subcategories.sort((a, b) => a.weight - b.weight);

    this.saveOrder();
  }

  constructor(category = {
    id: "",
    subcategories: [],
    title: ""
  }, url) {
    this.category = category;
    this.url = url;
  }

  getTemplate() {
    return `<div class="category category_open" data-id="${this.category.id}">
              <header class="category__header">${this.category.title}</header>
              <div class="category__body">
                <div class="subcategory-list"></div>
              </div>
            </div>`;
  }

  getListItems() {
    return this.category.subcategories.map(item => {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${item.id}">
          <strong>${item.title}</strong>
          <span>
            <b>${item.count}</b>
             products
          </span>
        </li>`;

      return wrapper.firstElementChild;
    });
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.listItems = this.getListItems();
    this.sortableList = new SortableList({ items: this.listItems });

    let place = this.element.querySelector('.subcategory-list');
    place.append(this.sortableList.element);

    this.addEventListeners();

    return this.element;
  }

  addEventListeners() {
    const header = this.element.querySelector('.category__header');

    header.addEventListener('click', (event) => {
      let elem = event.target.closest('.category');

      if (!elem) return;

      elem.classList.toggle('category_open');
    })

    this.sortableList.element.addEventListener('sortable-list-reorder', this.reorder);
  }

  async saveOrder() {
    try {
      const response = await fetchJson(this.url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.category.subcategories.map(item => {
          return { id: item.id, weight: item.weight }
        })),
      })
    } catch(error) {

      this.element.dispatchEvent(new CustomEvent('network-error', {
        bubbles: true,
        detail: error.message
      }));
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.sortableList.destroy();
  }
}
