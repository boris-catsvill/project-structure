import BasePage from '../base-page/index.js';
import Categories from '../../components/categories/index.js';

export default class Page extends BasePage {
  constructor(path) {
    super(path);
  }

  get template() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-element="categories"></div>
      </div>
    `;
  }

  async getComponents() {
    const categories = new Categories();

    return {
      categories
    };
  }
}
