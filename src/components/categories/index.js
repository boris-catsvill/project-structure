import fetchJson from '../../utils/fetch-json';
import SortableList from '../sortable-list';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Categories {
  element;
  categoryURL = new URL('/api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
  subcategoryURL = new URL('/api/rest/subcategories', BACKEND_URL);

  onOpen = event => {
    const target = event.target.closest('.category__header');
    if (!target) return;
    target.closest('.category').classList.toggle('category_open');
  };

  onListUpdate = async event => {
    const subcategoryElems = event.detail.list.children;
    let weight = 1;
    const subcategories = Array.from(subcategoryElems, elem => {
      return {
        id: elem.dataset.id,
        weight: weight++
      };
    });
    await this.sendData(subcategories);
    // Add notification
  };

  async render() {
    this.data = await this.loadData();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.renderSubcategories();
    this.initListeners();
  }

  get template() {
    return `
    <div class="categories__element">
      ${this.getCategories()}
    </div>
    `;
  }

  getCategories() {
    return this.data
      .map(item => {
        return `
        <div class="category category_open" data-id="${item.id}">
            <header class="category__header">${item.title}</header>
            <div class="category__body">
                <div class="subcategory-list"></div>
            </div>
        </div>`;
      })
      .join('');
  }

  renderSubcategories() {
    const containers = this.element.querySelectorAll('.subcategory-list');
    containers.forEach(container => {
      const id = container.closest('[data-id]').dataset.id;
      const category = this.data.find(category => category.id === id);
      const subcategories = this.getSubcategoryElements(category.subcategories);
      const list = new SortableList({ items: subcategories });
      container.append(list.element);
    });
  }

  getSubcategoryElements(subcategories) {
    return subcategories.map(subcategory => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${subcategory.id}">
            <strong>${subcategory.title}</strong>
            <span><b>${subcategory.count}</b> products</span>
        </li>`;
      return wrapper.firstElementChild;
    });
  }

  initListeners() {
    this.element.addEventListener('click', this.onOpen);
    this.element.addEventListener('list-updated', this.onListUpdate);
  }

  async loadData() {
    return fetchJson(this.categoryURL);
  }

  async sendData(subcategories) {
    const options = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(subcategories),
      method: 'PATCH'
    };
    await fetchJson(this.subcategoryURL, options);
  }

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
