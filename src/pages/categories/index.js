import Category from '../../components/categories/index.';
import { findSubElements } from '../../utils/find-sub-elements';
import fetchJson from '../../utils/fetch-json';

const CATEGORIES_URL = `/api/rest/categories?_sort=weight&_refs=subcategory`;
const UPDATE_ORDERS_URL = `api/rest/subcategories`;
const CATEGORIES_TITLE = 'Категории товаров';

export default class CategoriesPage {
  element;
  subElements = {
    categories: void 0
  };
  categories = [];

  getTemplate = () => `<div class='categories'>
      <div class='content__top-panel'>
        <h1 class='page-title'>${CATEGORIES_TITLE}</h1>
      </div>
      <div data-element='categories'>

      </div>
    </div>`;

  cleanCategories = () => {
    while (this.subElements.categories.firstChild) {
      this.subElements.categories.firstChild.remove();
    }
  };

  updateOrders = async (subcategories) => {
    await fetchJson(process.env.BACKEND_URL + UPDATE_ORDERS_URL, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'PATCH',
      body: JSON.stringify(subcategories)
    });
  };

  updateCategories = async () => {
    this.cleanCategories();
    const data = await fetchJson(CATEGORIES_URL);
    data.forEach(
      category => {
        this.categoryComponent = new Category({ category, updateOrders: this.updateOrders });
        this.subElements.categories.append(this.categoryComponent.element);
      }
    );
  };

  initSubElements = async () => {
    this.subElements = findSubElements(this.element);
    await this.updateCategories();
  };

  render = () => {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    void this.initSubElements();
    return this.element;
  };
  remove = () => {
    this.element.remove();
  };
  destroy = () => {
    this.remove();
    this.subElements = {};
    this.categoryComponent.destroy()
  };
}
