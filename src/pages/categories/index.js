import SortableList from '../../components/sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js'
import fetchJson from '../../utils/fetch-json.js';


export default class Page {
  element;
  url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', process.env.BACKEND_URL)
  updateURL = new URL('api/rest/subcategories', process.env.BACKEND_URL)
  data = [];

  async update(data) {
    try {
      await fetchJson(this.updateURL, {
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

    const subcategories = target.querySelectorAll('li');

    for (let i = 0; i < subcategories.length; i++) {
      const item = {
        id: '',
        title: '',
        count: 0,
        category: '',
        weight: 0
      }

      item.id = subcategories[i].dataset.id;
      item.title = subcategories[i].firstElementChild.textContent;
      item.count = parseInt(subcategories[i].querySelector('b').textContent);
      item.category = target.closest('[data-id]').dataset.id;
      item.weight = i + 1;

      data.push(item);
    }
    return data;
  }

  closeOnClick() {
    const categoriesHeaders = this.element.querySelectorAll('.category__header');

    categoriesHeaders.forEach(elem => {
      elem.addEventListener('click', event => {
        const parent = event.target.closest('.category');

        parent.classList.toggle('category_open')
      });
    });
  }

  destroy () {
    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
}