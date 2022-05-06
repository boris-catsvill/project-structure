import PageBase from '../../page-base.js';
import ProductFrom from '../../../components/product-form';

export default class Page extends PageBase {
  element;
  subElements;
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div>
        <h1>Edit page</h1>
        <div data-element="productForm"></div>
      </div>`;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
    const id = window.location.pathname.replace(/\/products\/(add)?/, '');
    
    const productForm = new ProductFrom(id);

    const elem = await productForm.render();
    this.subElements.productForm.append(elem);
    this.components.productForm = productForm;

    return this.element;
  }
}
