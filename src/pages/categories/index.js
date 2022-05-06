import PageBase from "../page-base";
import Category from "../../components/categories";
import fetchJson from "../../utils/fetch-json";
//import process from 'process';

export default class Page extends PageBase {
  subElements;
  components = [];

  async render() {    
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    
    this.subElements = this.getSubElements();
    
    const url = new URL('api/rest/categories?_sort=weight&_refs=subcategory', process.env.BACKEND_URL);
    this.data = await fetchJson(url);
    this.data.forEach(item => this.subElements.categoriesContainer.append(this.renderCategory(item)));

    return this.element;
  }

  renderCategory(data) {
    const category = new Category(data);
    this.components.push(category);
    return category.element;
  }

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element="categoriesContainer"></div>
      </div>
    `;
  }
}