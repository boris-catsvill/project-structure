import SortableList from '../sortable-list/index';
import fetchJson from '../../utils/fetch-json';
import NotificationMessage from '../notification';

export default class Categories {
  element = {};
  subElements = {};
  constructor(title = '', subcategories = [], id = '') {
    this.title = title;
    this.subcategories = subcategories;
    this.id = id;

    this.render();
  }

  get template() {
    return `
      <div class="category category_open" data-id="${this.id}">
        <header class="category__header" data-click="header">
          ${this.title}
        </header>
        <div class="category__body">
          <div class="subcategory-list" data-element="list"></div>
        </div>
      </div>
    `;
  }

  patchCategories = async (data) => {
    return await fetchJson(new URL('api/rest/subcategories', process.env.BACKEND_URL), {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

  render = () => {
    const wrapper = document.createElement('div');
    wrapper.insertAdjacentHTML('beforeend', this.template);

    this.element = wrapper.firstElementChild;

    this.getSubElements();

    this.subElements.list.append(new SortableList({items: this.getListItems()}).element);

    this.initEventListeners();
  };

  getSubElements = () => {
    this.subElements = [...this.element.querySelectorAll('[data-element]')].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  };

  initEventListeners = () => {
    this.element.querySelector('.category__header').addEventListener('pointerdown', event => {
      const target = event.target.closest('[data-click="header"]');
      if (target) {
        this.element.classList.toggle('category_open');
      }
    });
    
    this.element.querySelector('.sortable-list').addEventListener('sortable-list-reorder', async event => {
      const { from, to } = event.detail;
      this.subcategories.splice(to, 0, this.subcategories.splice(from, 1)[0]);
      this.subcategories.map((item, index) => item.weight = index + 1);
      
      await this.patchCategories(this.subcategories)
      .catch(() => {
        new NotificationMessage('Network error has occured.', {duration: 3000, type: 'error'}).show();
      })
      .then(() => {
        new NotificationMessage('Category order saved.', {duration: 3000, type: 'success'}).show();
      });
    });
  };

  getListItems = () => {
    return this.subcategories.map(item => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `<li class="categories__sortable-list-item" data-grab-handle data-id="${item.id}">
                            <strong>${item.title}</strong>
                            <span>
                              <b>${item.count}</b>
                              products
                            </span>
                          </li>`;
      return wrapper.firstElementChild;
    });
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    this.element = null;
    this.subElements = null;
  };
}