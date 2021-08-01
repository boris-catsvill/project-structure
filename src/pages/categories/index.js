import SortableList from '../../components/sortable-list/index.js';
import Notification from "../../components/notification/index.js";

import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  categories = {};
  components = {};
  subElements = {};

  reorderCategories = async event => {

    const subCategories = event.target.querySelectorAll('[data-id]');
    const newOrder =  [];

    [...subCategories].forEach((item, index) => {
      newOrder.push({
        id: item.dataset.id,
        weight: index + 1,
      });
    });

    const url = '/api/rest/subcategories';
    const requestURL = new URL(url, process.env.BACKEND_URL);

    let response = await fetch(requestURL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newOrder),
    });

    if (response.ok) {
      const massage = 'Порядок категорий сохранен';

      const notification = new Notification(massage);
      notification.show();
    }
  }

  async initComponents () {
    const {categories, components} = await this.getCategoryComponents();
    this.categories = categories;

    for (const component in components) {
      this.components[component] = components[component];
    }
  }

  async getCategoryComponents (){
    const components = [];
    const categories = [];
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);

    const getSubCategories = function (subCategories){
      if (!subCategories.length) return;

      subCategories.sort((a, b) => {
        return a.weight - b.weight;
      });

      const subCategoryList = [];
      subCategories.map(subCat => {
        const subCategory = document.createElement('li');
        subCategory.dataset.grabHandle = '';
        subCategory.dataset.id = subCat.id;
        subCategory.classList.add('categories__sortable-list-item');
        subCategory.innerHTML = `
            <strong>${subCat.title}</strong>
            <span><b>${subCat.count} ${subCat.weight}</b> products</span>
        `;
        subCategoryList.push(subCategory);
      });

      return new SortableList({items: subCategoryList});
    };

    data.map(cat => {
      const category = document.createElement('div');
      category.classList.add('category','category_open');
      category.dataset.id = cat.id;
      category.innerHTML = `
          <header class="category__header">${cat.title}</header>
          <div class="category__body">
            <div class="subcategory-list"></div>
          </div>
    `;
      const subCategoryList = category.querySelector('.subcategory-list');
      const component = getSubCategories(cat.subcategories);
      subCategoryList.append(component.element);

      categories.push(category);
      components.push(component);

    });

    return {categories, components};
  }

  get template () {
    return `
        <div class="categories">
          <div class="content__top-panel">
            <h2 class="page-title">Категории товаров</h2>
          </div>
            <!-- categoriesContainer component -->
            <div data-element="categoriesContainer">
                 category
                <div class="category category_open" data-id="">
                  <header class="category__header"></header>
                  <div class="category__body">
                    <div class="subcategory-list">
                      <ul class="sortable-list">
                        <li class="categories__sortable-list-item sortable-list__item"
                            data-grab-handle=""
                            data-id="">
                          <strong></strong>
                          <span><b></b></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>
          </div>
    `;
  }

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents () {
    this.subElements.categoriesContainer.innerHTML = '';
    this.subElements.categoriesContainer.append(...this.categories);
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  toggleCategories(event){
    const categoryHeader = event.target.closest('.category__header');
    if (!categoryHeader) return;
    categoryHeader.parentNode.classList.toggle('category_open');
  }

  initEventListeners () {
    this.element.addEventListener('sortable-list-reorder', this.reorderCategories);
    this.element.addEventListener('pointerdown', this.toggleCategories);
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.element.remove();
  }
}
