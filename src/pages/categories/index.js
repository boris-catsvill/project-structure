import fetchJson from '../../utils/fetch-json';
import SortableList from '../../components/sortable-list';
import NotificationMessage from '../../components/notification';

export default class Page {
  static BACKEND_URL = process.env.BACKEND_URL;

  element;
  subElements = {};
  components = {};

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
            <h1 class="page-title">Products Categories</h1>
        </div>
        <p>You can change order of subcategories inside category</p>
        <div data-elem="categoriesContainer"></div>
      </div>
    `;
  }

  async render() {
    await this.getCategories();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper;

    this.getSubElements(this.element);
    this.createCategories();
    this.addEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    for (const item of elements) {
      this.subElements[item.dataset.elem] = item;
    }
  }

  categoryTemplate({ id = '', title = '' }) {
    return `
      <div class="category category_open" data-id=${id}>
        <header class="category__header" data-elem=${id}>${title}</header>
        <div class="category__body">
            <div class="subcategory-list"></div>
        </div>
      </div>
    `;
  }

  createSubcategory({ id, title, count }) {
    return `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${id}">
        <strong>${title}</strong>
        <span>
            <b>${count}</b>
            products
        </span>
      </li>
    `;
  }

  createCategories() {
    const categoriesList = this.categories.map(category => {
      const categoryWrapper = document.createElement('div');

      categoryWrapper.innerHTML = this.categoryTemplate({ id: category.id, title: category.title });

      const subcategoriesNodes = category.subcategories.map(subcategory => {
        const liWrapper = document.createElement('div');
        liWrapper.innerHTML = this.createSubcategory({
          id: subcategory.id,
          title: subcategory.title,
          count: subcategory.count
        });

        return liWrapper.firstElementChild;
      });

      const sortableList = new SortableList({ items: subcategoriesNodes, id: category.id });
      this.components[category.id] = sortableList;

      const list = categoryWrapper.querySelector('.subcategory-list');
      list.append(sortableList.element);

      return categoryWrapper.firstElementChild;
    });

    categoriesList.forEach(item => this.subElements.categoriesContainer.append(item));
    this.getSubElements(this.element);
  };

  async getCategories() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);

    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    this.categories = await fetchJson(url);
  }

  async sendChangeOrderHandler(event) {
    const { id, from, to } = event.detail;
    const category = this.categories.find(item => item.id === id);

    if (from < to) {
      const x = category.subcategories.splice(from, 1);
      category.subcategories.splice(to - 1, 0, x[0]);
    }

    if (from > to) {
      const x = category.subcategories.splice(from, 1);
      category.subcategories.splice(to, 0, x[0]);
    }

    category.subcategories.forEach((item, index) => item.weight = index + 1);

    try {
      await fetchJson(`${Page.BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(category.subcategories)
      });

      const notification = new NotificationMessage('Order was changed!', { type: 'success' });
      notification.show();

    } catch (e) {
      console.dir(e);
      const notification = new NotificationMessage(e.body, { type: 'error' });
      notification.show();

      throw new Error(e.message);
    }
  }

  addEventListeners() {
    const headers = Object.values(this.subElements).reduce((acc, curr) => {
      if (curr.nodeName === 'HEADER') {
        acc.push(curr);
        return acc;
      } else return acc;
    }, []);

    headers.forEach(item => item.addEventListener('click', event => this.headerClickHandler(event)));

    this.subElements.categoriesContainer.addEventListener('change-order-in-sortable-list', event => this.sendChangeOrderHandler(event));
  };

  headerClickHandler = (event) => {
    const header = event.target.closest('div');
    if (header.classList.contains('category_open')) {
      header.classList.remove('category_open');
    } else {
      header.classList.add('category_open');
    }
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    Object.values(this.components).forEach(item => item.destroy());
  }
}
