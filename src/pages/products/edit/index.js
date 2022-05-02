import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.initComponents();
    await this.renderComponents();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `<div class="products-edit">
              <div class="content__top-panel">
                <h1 class="page-title">
                  <a href="/products" class="link">Products</a>
                </h1>
              </div>
              <div class="content-box"></div>
            </div>`;
  }

  initComponents() {
    const productId = decodeURI(window.location.pathname)
      .replace(/^\/products\//, '')
      .replace(/^add$/, '');

    const place = this.element.querySelector(`.page-title`);
    let textNode;

    if (productId) {
      this.components.productFrom = new ProductForm(productId);
      textNode = document.createTextNode(" / Edit");
    } else {
      this.components.productFrom = new ProductForm();
      textNode = document.createTextNode(" / Add");
    }

    place.append(textNode);
  }

  async renderComponents() {
    const elem = await this.components.productFrom.render();
    const place = this.element.querySelector(`.content-box`);

    place.append(elem);
  }

  addEventListeners() {
    this.components.productFrom.element.addEventListener('product-updated', (event) => {
      this.showNotification({ type: 'notification_success', name: 'Product updated', id: event.detail });
    })
    this.components.productFrom.element.addEventListener('product-saved', (event) => {
      this.showNotification({ type: 'notification_success', name: 'Product saved' });
    })
  }

  showNotification(message) {
    const notification = new NotificationMessage(message.name, {
      duration: 2000,
      type: message.type,
    });

    notification.show(this.components.productFrom.element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
