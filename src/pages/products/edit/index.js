import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification/index.js';


export default class Page {
  element = {};
  components = {};
  productId = '';

  onProductSaved = (event) => {
    document.addEventListener('route',(function cb() {
      new NotificationMessage('Product saved', {
        type: 'success',
      }).show();
      document.removeEventListener('route', cb);
    }));

    Router.instance().navigate(`/products/${event.detail.id}`);
  }

  onProductUpdated = () => {
    const notification = new NotificationMessage('Product updated', {
      type: 'success',
    });
    notification.show(this.element);
  }

  constructor() {
    this.productId = document.URL.split("/").pop();
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div>
        <h1>Edit page</h1>
      </div>`;

    this.element = element.firstElementChild;

    this.initComponents();
    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    this.components.productForm = new ProductForm(this.productId);
  }

  async renderComponents() {
    const element = await this.components.productForm.render();

    this.element.append(element);
  }

  initEventListeners() {
    this.element.addEventListener('product-updated', this.onProductUpdated);
    this.element.addEventListener('product-saved', this.onProductSaved);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
