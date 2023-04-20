//import ProductForm from '../../../components/product-form';
import menu from '../../../components/sidebar/menu';
import { IPage } from '../../../types/types';

class ProductsPage implements IPage {
  element: Element;
  subElements = {};
  components = {};

  get type() {
    return menu.products.page;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div>
        <h1>List page</h1>
      </div>`;

    this.element = element.firstElementChild!;

    return this.element;
  }

  initComponents() {
    const productId = '101-planset-lenovo-yt3-x90l-64-gb-3g-lte-cernyj';

    //this.components.productFrom = new ProductForm(productId);
  }

  async renderComponents() {
    //const element = await this.components.productFrom.render();
    //this.element.append(element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      //component.destroy();
    }
  }
}

export default ProductsPage;
