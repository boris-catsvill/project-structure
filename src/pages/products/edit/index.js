import getSubElements from '../../../utils/getSubElements';
import ProductForm from '../../../components/product-form';

export default class Page {
  element;
  subElements = {};
  components = {};
  productId = '';
  title = '';

  getTemplate() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / ${this.title}
        </h1>
        </div>
        <div data-elem="contentBox" class="content-box">

        </div>
      </div>
    `;
  }

  initComponents() {
    const productForm = new ProductForm(this.productId);

    this.components = {
      productForm,
    }
  }

  renderComponents() {
    this.subElements.contentBox.append(this.components.productForm.element);
  }

  checkProductId() {
    const { pathname } = window.location;
    if (pathname.substring(10) === 'add') {
      this.productId = null;
      this.title = 'Добавить';
    } else {
      this.title = 'Редактировать';
      this.productId = pathname.substring(10);
    }
  }

  async render() {
    this.checkProductId();

    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = getSubElements(this.element, 'elem');

    this.initComponents();
    this.renderComponents();

    return this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
