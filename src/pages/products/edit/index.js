import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification';

export default class Page {
  element;
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.createComponents();
    await this.renderComponents();
    this.initEventListeners();
    return this.element;
  }
  getTemplate() {
    return `<div class="products-edit">
              <div class="content__top-panel">
                <h1 class="page-title">
                  <a href="/products" class="link">Products</a>
                </h1>
              </div>
              <div class="content-box">
              
              </div>
            </div>`;
  }
  createComponents() {
    const productId = decodeURI(window.location.pathname)
      .replace(/^\/products\//, '')
      .replace(/^add$/, '');

    const pageProductTitle = this.element.querySelector(`.page-title`);
    let textNode;

    if (productId) {
      this.components.productFrom = new ProductForm(productId);
      textNode = document.createTextNode(' / Edit');
    } else {
      this.components.productFrom = new ProductForm();
      textNode = document.createTextNode(' / Add');
    }

    pageProductTitle.append(textNode);
  }
  async renderComponents() {
    const element = await this.components.productFrom.render();
    const content = this.element.querySelector(`.content-box`);

    content.append(element);
  }
  initEventListeners() {
    this.components.productFrom.element.addEventListener('product-updated', event => {
      this.showNotification({
        type: `notification_${event.detail.status} show`,
        name: event.detail.status === 'success' ? 'Товар обновлен' : 'Ошибка обновления',
        id: event.detail.id
      });
    });
    this.components.productFrom.element.addEventListener('product-saved', event => {
      this.showNotification({
        type: `notification_${event.detail.status} show`,
        name: event.detail.status === 'success' ? 'Товар сохранен' : 'Ошибка сохранения'
      });
    });
  }
  showNotification(message) {
    const notification = new NotificationMessage(message.name, {
      duration: 2000,
      type: message.type
    });

    notification.show(this.components.productFrom.element);
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    Object.values(this.components).forEach(item => item.destroy());
  }
}
