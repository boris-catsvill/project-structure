import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js';
export default class Page {
  element;
  form;
  constructor(match) {
    this.url = match[1];
  }
  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.form = await this.editProduct();
    this.initEventListeners();
    return this.element;
  }
  getTemplate() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
      <h1 class="page-title"><a href="/products" class="link">Товары</a> / Редактировать</h1>
      </div>
      <div class="content-box">
      </div>
    </div>
    `;
  }

  async editProduct() {
    const productForm = await new ProductForm(this.url);
    const form = await productForm.render();
    const contentBox = this.element.querySelector('.content-box');
    contentBox.innerHTML = '';
    contentBox.append(form);
    return form;
  }
  initEventListeners() {
    this.form.addEventListener('product-saved', () => {
      new NotificationMessage('Товар сохранен', {
        duration: 3000,
        type: 'success'
      }).show();
    });

    this.form.addEventListener('product-updated', () => {
      new NotificationMessage('Товар обновлен', {
        duration: 3000,
        type: 'success'
      }).show();
    });

    this.form.addEventListener('error', () => {
      new NotificationMessage('Прозошла ошибка', {
        duration: 3000,
        type: 'error'
      }).show();
    });
  }

  removeEVentListenersH() {}
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.form = null;
    this.removeEVentListeners();
  }
}
