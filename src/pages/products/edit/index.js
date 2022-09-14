import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification/index.js';


export default class Page {
  element = {};
  components = {};

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
    const productId = document.URL.split("/").pop();
    this.components.productForm = new ProductForm(productId);
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
    this.element.removeEventListener('product-updated', this.onProductUpdated);
    this.element.removeEventListener('product-saved', this.onProductSaved);

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
