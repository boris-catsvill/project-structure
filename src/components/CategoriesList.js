import SortableList from "./SortableList.js";

import grabIcon from '../styles/svg/icon-grab.svg';

export default class CategoriesList {
  data = []
  element = null

  constructor(url) {
    const [path, backedURL] = url;
    this.url = new URL(path, backedURL);
    this.setSearchParams();
  }

  setSearchParams() {
    this.url.searchParams.set('_sort', 'weight');
    this.url.searchParams.set('_refs', 'subcategory');
  }

  getSubCategoryList(subCategory) {
    const { id, title, count } = subCategory;
    const wrapper = document.createElement('div');

    const subCategoryLI = `
        <li class="categories__sortable-list-item sortable-list__item"  data-id="${id}">
            <img src=${grabIcon} data-grab-handle="" alt="grab">
            <strong >${title}</strong>
            <span><b>${count}</b> products</span>
        </li>`;

    wrapper.innerHTML = subCategoryLI;
    return wrapper.firstElementChild;
  }

  getCategory(category) {
    const wrapper = document.createElement('div');

    const { id, subcategories, title } = category;
    const subcategoryList = subcategories.map(this.getSubCategoryList);

    const categoryBody = `
        <div class="category category_open" data-id="${id}" data-element="category">
            <header class="category__header" data-element="categoryHeader">
                ${title}
            </header>
            <div class="category__body">
                <div class="subcategory-list" data-element="subCatListContainer"></div>
            </div>
       </div>`;

    wrapper.innerHTML = categoryBody;
    const categoryElement = wrapper.firstElementChild;
    
    const subCatListContainer = categoryElement.querySelector('[data-element="subCatListContainer"]');
    subCatListContainer.append(new SortableList({items: subcategoryList}).element);
    
    return categoryElement;
  }

  get categoriesList() {
    const element = document.createElement('div');
    element.setAttribute('data-element', 'categoriesContainer');

    const bodyOfelement = this.data.map((category) => this.getCategory(category));

    element.append(...bodyOfelement);
    return element;
  }

  async setData() {
    const response = await fetch(this.url.toString());
    this.data = await response.json();

  }

  toggleOfOpenCategoryHandler = (event) => {
    const target = event.target.closest('[data-element="categoryHeader"]');
    if (!target) {return;}
    const elementForToggle = event.target.closest('[data-element="category"]');
    elementForToggle.classList.toggle('category_open');
  }

  async render() {
    await this.setData();
    this.element = this.categoriesList;
    this.element.addEventListener('click', this.toggleOfOpenCategoryHandler);
    return this.element;
  }

  remove() {
    this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
  }

}