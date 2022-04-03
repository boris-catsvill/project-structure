import ProductForm from "../../../components/product-form/index.js";
import Notification from "../../../components/notification/index.js";
import Router from "../../../router/index.js";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  get template () {
    return `<div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Products</a> / Add
        </h1>
      </div>

      <div data-element="content" class="content-box">
        <!-- product form component -->
      </div>
    </div>`;
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initComponents() {
    this.components.productFrom = new ProductForm();
  }

  initEventListeners () {
    this.components.productFrom.element.addEventListener('product-saved', event => {
      const id = event.detail;

      const notification = new Notification('Product created!', {
        duration: 2000,
        type: 'success'
      });
  
      notification.show();

      const router = Router.instance();

      router.navigate(`/products/${id}`);
    });
  }

  async renderComponents() {
    const element = await this.components.productFrom.render();

    this.subElements.content.append(element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
