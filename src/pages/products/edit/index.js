import BasePage from '../../base-page/index.js';
import ProductForm from '../../../components/product-form';

export default class Page extends BasePage {
  constructor(path) {
    super(path);
    this.productId = path[1];
  }

  async getComponents() {
    const productForm = new ProductForm(this.productId);

    return {
      productForm
    };
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / ${this.productId ? 'Редактировать' : 'Добавить'}
          </h1>
        </div>
        <div class="content-box">
          <div data-element="productForm"></div>
        </div>
      </div>
    `;
  }
}

