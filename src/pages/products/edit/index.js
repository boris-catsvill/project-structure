import ProductForm from "../../../components/product-form";
import Notification from "../../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};
  title = 'Редактировать';

  async render() {
    const element = document.createElement('div');

    this.initComponents();

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  get template(){
    return `
        <div class="product-edit">
            <div class="content__top-panel">
              <h1 class="page-title"><a href="/products" class="link">Товары</a> / ${this.title}</h1>
            </div>
            <div data-element="contentBox" class="content-box"></div>
        </div>
    `;
  }

  initComponents() {
    const url = new URL (window.location);
    let productId = url.pathname.replace('/products/', '');

    if (productId === 'add') {
      productId = null;
      this.title = 'Добавить'
    }

    this.components.productForm = new ProductForm(productId);
  }

  async renderComponents() {
    const element = await this.components.productForm.render();
    this.subElements.contentBox.append(element);
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  pushNotification(event){
    let message;
    switch (event.type) {
      case 'product-updated':
        message = 'Товар отредактирован';
        break;
      case 'product-saved':
        message = 'Товар отредактирован';
        break;
    }

    // const massage = 'Товар отредактирован';
    const notification = new Notification(message);
    notification.show();
  }

  initEventListeners(){
    this.element.addEventListener('product-updated', this.pushNotification)
    this.element.addEventListener('product-saved', this.pushNotification)
  }

  remove(){
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
  }

}
