import fetchJson from '../../utils/fetch-json.js';
import Categories from "../../components/categories";

const BACKEND_URL = 'https://course-js.javascript.ru/';
const CATEGORY_URL = 'api/rest/categories';

export default class Page {
  element;
  categoriesElement;

  constructor() {
    this.render();
  }

  get template() {
    return `<div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Категории товаров</h1>
      </div>
        </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.categoriesElement = new Categories(CATEGORY_URL);

    this.element.append(this.categoriesElement.element);

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    //this.element.addEventListener('date-select', this.onDateSelect);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
