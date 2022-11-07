import ProductForm from "../../../components/product-form";
import NotificationMessage from '../../../components/notification/index.js'

export default class Page {
  element;
  components = {};

  constructor([, match]) {
    this.productID = match;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.initComponents();
    this.renderForm(this.components.productForm);

    return this.element;
  }

  getTemplate() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / Редактировать
        </h1>
      </div>
      <div class="content-box"></div>
    </div>
    `
  }

  initComponents() {
    const productForm = new ProductForm(this.productID)

    this.components = {
      productForm,
    }
  }

  async renderForm(productForm) {
    await productForm.render();

    productForm.element.addEventListener('product-saved', () => {
      const notification = new NotificationMessage('Товар сохранен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    });

    productForm.element.addEventListener('product-updated', () => {
      const notification = new NotificationMessage('Товар обновлен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    })

    const contentBox = this.element.querySelector('.content-box');
    contentBox.append(productForm.element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
