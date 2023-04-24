import fetchJson from '../product-form/utils/fetch-json';
import SortableList from '../sortable-list';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class CategoriesContainer {
  element;
  subElements;
  components;

  constructor(categoriesData) {
    this.categoriesData = categoriesData;
    this.initSortableList();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.renderCategoryContainer();
    this.element = wrapper;
    this.subElements = this.getSubElements();
    this.initEventListener()
    return wrapper;
  }

  renderCategoryContainer() {
    return [...this.categoriesData].map(category => {

      return `
         <div class='category category_open' data-id='${category.id}'>
          <header class='category__header'>${category.title}</header>
          <div class='category__body'>
            <div class='subcategory-list'>
              <ul class='sortable-list'>
              ${this.fillSubCategories(category.subcategories)}
            </ul>
          </div>
          </div>
       </div>
      `;
    }).join('');
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    // this.removeDocumentEventListeners();
    this.element = null;
  }

  fillSubCategories(subcategories) {
    return [...subcategories].map(subcategory => {
      return `
         <li class='categories__sortable-list-item sortable-list__item' data-grab-handle='' data-id='${subcategory.id}'>
           <strong>${subcategory.title}</strong>
           <span><b>${subcategory.count}</b> products</span>
         </li>
      `;
    }).join('');
  }

  initEventListener() {
    Object.values(this.subElements).forEach(element => {
      element = element.querySelector('header');
      element.addEventListener('click', this.onHeaderClick)
    })
  }

  onHeaderClick(event) {
    event.target.closest('.category').classList.toggle("category_open")
  }

  initSortableList() {
    // const SortableList = new SortableList();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('.category');

    [...elements].map(element => {
      result[element.dataset.id] = element;
    });

    return result;
  }
}