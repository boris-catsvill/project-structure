import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification';
import Router from '../../../router/index.js';
const router = Router.instance();

export default class Page {
  conponents;
  productId = this.getProductId();

  onProductUpdate = () => {
    const notification = new NotificationMessage('Товар сохранен', {
      duration: 2000,
      type: 'success'
    });
    notification.show();
  };

  onProductSave = (event) => {
    const notification = new NotificationMessage('Товар создан', {
      duration: 2000,
      type: 'success'
    });
    notification.show();

    router.navigate(`/products/${event.detail.product.id}`);
  };

  getProductId() {
    const herfArray = window.location.href.split('/');
    return herfArray[herfArray.length - 1] !== 'add' ? herfArray[herfArray.length - 1] : null;
  }

  async render() {
    await this.initComponents();
    this.element = this.toHTML(this.getTemplate());
    this.renderComponents();
    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();
    return this.element;
  }

  getTemplate() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title"><a href="/products" class="link">Товары</a> / Добавить</h1>
        </div>
        <div class="content-box">
          <div data-productForm></div>
        </div>
      </div>
    `;
  }

  async initComponents() {
    const productForm = new ProductForm(this.productId);
    await productForm.render();

    this.components = {
      productForm
    };
  }

  renderComponents() {
    for (const component of Object.entries(this.components)) {
      this.element.querySelector(`[data-${component[0]}]`).replaceWith(component[1].element);
    }
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach(el => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  addEventListeners() {
    document.addEventListener('product-updated', this.onProductUpdate);
    document.addEventListener('product-saved', this.onProductSave);
  }

  removeEventListeners() {
    document.removeEventListener('product-updated', this.onProductUpdate);
    document.removeEventListener('product-saved', this.onProductSave);
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}
