import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js'

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  subElements = {};
  components = {};
  url = new URL('api/dashboard/bestsellers', BACKEND_URL);
  constructor(
    match = ''
  ){
    this.productId = match.replace(/products\/(.+)/, (...match) => {
      return match[1] !== 'add' ? match[1] : ''
    });
  }
  initComponents() {
    const productForm = new ProductForm(this.productId);

    this.components = {
      productForm,
    };
  }

  async render() {
    this.initComponents();
    await this.components.productForm.render();
    this.initEventListeners();
    return this.components.productForm.element;
  }

  initEventListeners() {
    this.components.productForm.element.addEventListener('product-saved', event => {
      console.error('product-saved', event.detail);
      const notification = new NotificationMessage('Товар сохранен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    });

    this.components.productForm.element.addEventListener('product-updated', event => {
      console.error('product-updated', event.detail);
      const notification = new NotificationMessage('Товар добавлен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    })

  }
  destroy() {
    this.subElements = {};
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
