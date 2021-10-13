import { findSubElements } from '../../../utils/find-sub-elements';
import ProductForm from '../../../components/product-form';

const PAGE_PRODUCTS_TITLE = 'Товары';
const ADD_PRODUCTS_TITLE = ' / Добавить';

export default class PageEditProducts {
  element;
  subElements = {};

  productsEditCreator = async () => {
    const path = window.location.pathname;
    const productId = path.match(/add$/) ? '' : path.split('/')[2];
    let productForm = new ProductForm(productId);
    await productForm.render();
    return productForm;
  };

  renderComponents = async () => {
    this.subElements = findSubElements(this.element);
    this.editProductForm = await this.productsEditCreator();
    this.subElements.editProductForm.append(this.editProductForm.element);
  };

  getTemplate = () => {
    return `
    <section class='content' id='content'><div class='products-edit'>
      <div class='content__top-panel'>
        <h1 class='page-title'>
          <a href='/products' class='link'>${PAGE_PRODUCTS_TITLE}</a>${ADD_PRODUCTS_TITLE}
        </h1>
      </div>
      <div class='content-box'>
          <div data-element='editProductForm'></div>
    </div></section>
    `;
  };

  render = () => {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    void this.renderComponents();

    return this.element;
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    this.editProductForm.destroy();
  };
}
