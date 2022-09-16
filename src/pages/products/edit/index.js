import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification";
import Router from "../../../router";

export default class Page {
  element;
  subElements = {};
  components = {};

  onProductSaved = (event) => {
    const notification = new NotificationMessage('Product saved', {
      type: 'success',
     });
    const onRouter = () => {
      notification.show();
    };
    document.addEventListener('route', onRouter, {once : true});

    Router.instance().navigate(`/products/${event.detail.id}`);
  }

  onProductUpdated = (event) => {
    const notification = new NotificationMessage('Product updated', {
      type: 'success',
    });
    notification.show(this.element);
  }

  constructor() {
    this.productId = decodeURI(window.location.pathname)
      .replace(/^\/products\//, '')
      .replace(/^add$/, '');
  }

  get template() {
    return `<div class="products-edit">
              <div class="content__top-panel">
                <h1 class="page-title">
                  <a href="/products" class="link">Products</a>
                  ${this.productId? " / Edit" : " / Add"}
                </h1>
              </div>
              <div data-element="productFormContainer" class="content-box"></div>
            </div>`;
  }

  initComponents() {
    this.components.productFormContainer = new ProductForm(this.productId);
  }

  async renderComponents() {
    const productForm = await this.components.productFormContainer.render();
    this.subElements.productFormContainer.append(productForm);
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
    this.initComponents();
    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.element.addEventListener('product-updated', this.onProductUpdated);
    this.element.addEventListener('product-saved', this.onProductSaved);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    Object.values(this.components).map(component => component.destroy());
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}