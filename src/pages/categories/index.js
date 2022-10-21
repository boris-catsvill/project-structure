import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js'

import fetchJson from '../../utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL)
  data = [];

  async render() {
    this.data = await fetchJson(this.url);

    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.getSubCategories();
    this.closeOnClick();
    this.initEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
      <div data-element="categoriesContainer">
        ${this.getCategoriesList(this.data)}
      </div>
    </div>`
  }

  getCategoriesList(data) {
    return data.map(category => {
      return`
      <div class="category category_open" data-id="${category.id}">
        <header class="category__header">
          ${category.title}
        </header>

        <div class="category__body">
          <div class="subcategory-list">
          </div>
        </div>

      </div>`
    }).join('');
  }

  getSubCategories() {
    const sortableLists = this.element.querySelectorAll('.subcategory-list');

    const subcategoriesData = this.data.map(item => {
      const { subcategories } = item;
      return subcategories;
    });

    for (let i = 0; i < sortableLists.length; i++) {

      const sortableList = new SortableList({
        items: subcategoriesData[i].map(item => {
          const element = document.createElement('div');

          element.innerHTML = `
          <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${item.id}">
            <strong>${item.title}</strong>
            <span><b>${item.count}</b> products</span>
          </li>`

          return element.firstElementChild;
        })
      })

      sortableLists[i].append(sortableList.element)
    }
  }

  initEventListeners() {
    this.element.addEventListener('sortable-list-reorder', (event) => {
      const data = this.getDataForPatch(event.target);

      this.update(data);
    })
  }

  getDataForPatch(target) {
    const data = [];

    for (let i = 0; i < target.children.length; i++) {
      const item = {
        id: '',
        title: '',
        count: 0,
        category: '',
        weight: 0
      }

      item.id = target.children[i].dataset.id;
      item.title = target.children[i].firstElementChild.textContent;
      item.count = parseInt(target.children[i].querySelector('b').textContent);
      item.category = target.closest('[data-id]').dataset.id;
      item.weight = i + 1;

      data.push(item);
    }
    return data;
  }

  async update(data) {
    try {
      await fetchJson(`${BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const notification = new NotificationMessage('Category order saved', {
        duration: 2000,
        type: 'success'
      });

      notification.show();

    } catch (error) {
      console.error('something went wrong', error);

      const notification = new NotificationMessage('Category order saving error', {
        duration: 2000,
        type: 'error'
      });

      notification.show();
    }
  }

  closeOnClick() {
    const categoriesHeaders = this.element.querySelectorAll('.category__header');

    categoriesHeaders.forEach(elem => {
      elem.addEventListener('click', event => {
        const parent = event.target.closest('.category');

        if ( parent.classList.contains('category_open') ) {
          parent.classList.remove('category_open')
        } else {
          parent.classList.add('category_open')
        };

      });
    });
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}