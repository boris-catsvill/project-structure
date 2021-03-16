import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/notification.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  currentId = "";

  get template() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
      <h1 class="page-title">
          <a href="/products" class="link">Products</a> /${this.currentId ? "Update" : "Add"} 
        </h1>
      </div>

      <div class="content-box">       
        <div data-element="productForm" class="product-form"></div>
      </div>
    </div>
    `;
  } 

  async render() {
    this.initId();
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }
  initId() {
    const currentURL = document.location.href;
    const url = new URL(currentURL);
    this.currentId = url.pathname.match(/products\/add/) ? "" : url.pathname.match(/([\w()-]+)$/g)[0];
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  async initComponents() {
    const productForm = new ProductForm(this.currentId);
    await productForm.render();
    this.components = {productForm};

  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component]; 
      root.append(element);
    });
  } 

  renderNotification(message) {
    const notification = new NotificationMessage(message);
    notification.show();
  }

  initEventListeners() {
    this.components.productForm.element.addEventListener('product-saved', event => {
      this.renderNotification('Product saved');
      console.error('product-saved', event.detail);
    });
    this.components.productForm.element.addEventListener('product-updated', event => {
      this.renderNotification('Product updated');
      console.error('product-updated', event.detail);
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
