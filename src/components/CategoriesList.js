import SortableList from "./SortableList.js";

import fetchJson from "../utils/fetchJson.js";

import grabIcon from '../styles/svg/icon-grab.svg';

export default class CategoriesList {
  data = []
  element = null

  constructor(url) {
    this.url = new URL(url);
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

  createSortableList(wrapper) {

    const subcategoryList = subcategories.map(this.getSubCategoryList);

    const subcategoriesListContainer = wrapper.querySelector('[data-element="subCatListContainer"]');
    subcategoriesListContainer.append(new SortableList({ items: subcategoryList }).element);
  } 

  getCategory(category) {
    const wrapper = document.createElement('div');

    const { id, subcategories, title } = category;


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

    createSortableList(categoryElement);
    return categoryElement;
  }

  get elementDOM() {
    const wrapper = document.createElement('div');
    const bodyOfWrapper = '<div data-element="categoriesContainer"></div>';

    wrapper.innerHTML = bodyOfWrapper;
    return wrapper.firstElementChild;
  }

  async setData() {
    this.data = await fetchJson(this.url.toString())
  }

  toggleOfOpenCategoryHandler = (event) => {
    const target = event.target.closest('[data-element="categoryHeader"]');
    if (!target) { return; }
    const elementForToggle = event.target.closest('[data-element="category"]');
    elementForToggle.classList.toggle('category_open');
  }

  addEventListeners() {
    this.element.addEventListener('click', this.toggleOfOpenCategoryHandler);
  }

  render() {
    this.element = this.elementDOM;
    this.addEventListeners();
  }

  async update() {
    await this.setData();
    const bodyOfelement = this.data.map((category) => this.getCategory(category))
    this.element.append(...bodyOfelement);
  }

  remove() {
    this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
  }

}