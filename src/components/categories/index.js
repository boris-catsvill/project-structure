import fetchJson from '../../utils/fetch-json.js';
import SortableList from "../../components/sortable-list";

const BACKEND_URL = process.env.BACKEND_URL;

export default class Categories {
  element;
  categoriesNSubcategories;

  onHeaderClick = event => {
    if (!event.target.classList.contains('category__header')) {
      return;
    }

    const category = event.target.closest('.category');
    if (category) {
      category.classList.toggle('category_open');
    }
  };

    onSorted = async event => {
      let subcategories = [];

      for (let order = 0; order < event.target.children.length; order++) {
        subcategories.push({'id': event.target.children[order].dataset.id, "weight": order + 1})
      }

    try {
      const response = await fetch(this.subcategoriesUrl.toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(subcategories),
        referrer: ''
      });

      this.element.dispatchEvent(new CustomEvent('subcategories-sorted',
        {
          bubbles: true,
          detail: {
            note: 'Порядок категорий сохранён',
            type: 'success'
          }
        }));

      return await response.json();
    } catch (error) {
      this.element.dispatchEvent(new CustomEvent('subcategories-sorted',
        {
          bubbles: true,
          detail: {
            note: 'Во время сохранения произошла ошибка',
            type: 'error'
          }
        }));
      return Promise.reject(error);
    }
  };

  constructor(url) {
    this.categoriesNSubcategoriesUrl = new URL(url, BACKEND_URL);
    this.subcategoriesUrl = new URL('api/rest/subcategories', BACKEND_URL);
    this.render();
  }

  get template() {
    return `<div data-elem="categoriesContainer">
          </div>`;
  }

  async renderCategories() {
    this.categoriesNSubcategories = await this.loadCategoriesNSubcategories();

    return Object.values(this.categoriesNSubcategories)
      .map(category => {
        const element = document.createElement('div');
        element.className = "category category_open";
        element.dataset.id = category.id;

        element.innerHTML = `<header class="category__header">
            ${category.title}
          </header>
          <div class="category__body">
            <div class="subcategory-list">
            </div>
          </div>`;

        const subcategoryList = element.querySelector('.subcategory-list');

        const subcategoryElement = new SortableList({
          items: category.subcategories
            .map(subcategory => this.renderSubcategory(subcategory))
        });
        subcategoryList.append(subcategoryElement.element);

        this.element.append(element);
      });
  }

  renderSubcategory(subcategory) {
    const element = document.createElement('li');
    element.className = "categories__sortable-list-item";
    element.dataset.grabHandle = "";
    element.dataset.id = subcategory.id;
    element.innerHTML
      = `<strong>${subcategory.title}</strong>
      <span><b>${subcategory.count}</b> products</span>`;
    return element;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.renderCategories();

    this.initEventListeners();

    return this.element;
  }

  loadCategoriesNSubcategories() {
    this.categoriesNSubcategoriesUrl.searchParams.set('_sort', 'weight');
    this.categoriesNSubcategoriesUrl.searchParams.set('_refs', 'subcategory');
    return fetchJson(this.categoriesNSubcategoriesUrl);
  }

  initEventListeners() {
    this.element.addEventListener('click', this.onHeaderClick);
    this.element.addEventListener('sortable-list-reorder', this.onSorted);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
