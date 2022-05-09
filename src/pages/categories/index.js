import SortableList from '../../components/sortable-list/index.js';
import Notification from '../../components/notification/index.js';

import fetchJson from '../../utils/fetch-json.js';
import escapeHtml from "../../utils/escape-html";

const BACKEND_URL = 'https://course-js.javascript.ru/';
const endpoint = 'api/rest/categories';

export default class CategoriesPage {
  subelements = {}
  sortableListArrayComponents = []
  saveOrderList = async (event) => {
    const url = new URL(BACKEND_URL + 'api/rest/subcategories');
    const requestData = this.getRequestData(event.target, event.detail);
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      }).then(r => r.json());
      event.target.innerHTML = response.map(subcat => {
        return this.getTemplateSubcategory(subcat);
      }).join('');
      const notification = new Notification("Успешно сохранено!", {type: 'success', duration: 1000});
      notification.show();
    } catch (error) {
      const notification = new Notification("Возникла проблема при сохранении!", {type: 'error'});
      notification.show();
      console.error(error);
    }

  }
  toggleVisabilityOfSubcats = event => {
    if (event.which !== 1) {
      return false;
    }
    const target = event.target;
    const header = target.closest('.category__header');
    if (header) {
      header.closest('.category').classList.toggle('category_open');
    }
  }

  async render () {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subelements = this.getSubelements();
    const data = await this.fetchData();
    const {categoriesContainer} = this.subelements;
    categoriesContainer.innerHTML = data.map(categoty => {
      return this.getTemplateCategory(categoty);
    }).join('');
    this.subelements.sortableListArrayElements = [...this.element.querySelectorAll('.sortable-list')];
    this.initSortableList();
    document.getElementsByClassName('progress-bar')[0].style.display = 'none';
    this.initEvents();
    return this.element;
  }

  getTemplate () {
    return `
     <div class="categories">
        <div class="content__top-panel">
            <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element="categoriesContainer">

        </div>
     </div>
    `;
  }

  getTemplateCategory (item) {
    return `
      <div class="category category_open" data-id=${item.id}>
        <header class="category__header">
            ${item.title}
        </header>
        <div class="category__body">
            <div class="subcategory-list">
                <ul class="sortable-list">
                    ${item.subcategories.map(subcat => {
                      return this.getTemplateSubcategory(subcat);
                    }).join('')}
                </ul>
            </div>
        </div>
      </div>
    `;
  }

  getTemplateSubcategory (subcat) {
    return `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id=${subcat.id}>
        <strong>${subcat.title}</strong>
        <span><b>${subcat.count}</b> products</span>
      </li>
    `;
  }



  getSubelements () {
    const subs = {};
    const subsList = this.element.querySelectorAll('[data-element]');

    for (const element of subsList) {
      subs[element.dataset.element] = element;
    }

    return subs;
  }

  initEvents () {
    const {categoriesContainer} = this.subelements;
    categoriesContainer.addEventListener('pointerdown', this.toggleVisabilityOfSubcats);
  }







  async fetchData (url = this.defaultUrl) {
    return fetchJson(url);
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    for (const component in this.componentsObject) {
      this.componentsObject[component].destroy();
    }
    this.componentsObject = null;
    this.subelements = null;
  }

  get defaultUrl () {
    const url = new URL(BACKEND_URL + endpoint);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return url;
  }

  initSortableList () {
    const {sortableListArrayElements} = this.subelements;

    sortableListArrayElements.forEach(ulElement => {
      this.sortableListArrayComponents.push(new SortableList({element: ulElement}));
      ulElement.addEventListener('sortable-list-reorder', this.saveOrderList);
    });
  }

  getRequestData (ulElement, detail) {
    const children = [...ulElement.children];

    return children.map((element, index) => {
      return {
        id: element.dataset.id,
        weight: index + 1
      };
    });

  }

}




const defaultSortTableChartFormat = {url: 'api/rest/products', immediateFetch: true, isSortLocally: false, chunk: 30, sorted: {id: 'name', order: 'asc'}};

