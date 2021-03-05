import fetchJson from '../../utils/fetch-json';
const BACKEND_URL = 'https://course-js.javascript.ru';
import SortableList from '../sortable-list/index.js';

export default class Categories {
  async getData() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async render(container) {
    this.data = await this.getData();
    container.innerHTML = this.getTemplate(this.data);
    container.querySelectorAll('[data-element="list"]').forEach(list => {
      new SortableList({ element: list, items: [...list.querySelectorAll('.sortable-list__item')] })
    })
  }

  getTemplate(data) {
    return data.map((item) => {
      return `
        <div class="category category_open" data-id="">
          <header class="category__header">
            ${item.title}
          </header>
          <div class="category__body">
            <div class="subcategory-list">
              <ul class="sortable-list" data-element="list">
                ${item.subcategories.map(category => {
                    return this.getCategoryTemplate(category)
                }).join('')}
              </ul>
            </div>
          </div>
        </div>
      `
    }).join('');
  }

  getCategoryTemplate(category) {
    return `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
        data-id="tovary-dlya-doma">
        <strong>${category.title}</strong>
        <span><b>${category.count}</b> products</span>
      </li>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {})
  }
}
