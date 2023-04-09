import PageComponent from '../../page';
import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification';
import Router from '../../../router';

export default class Page extends PageComponent {
  get template() {
    return `
      <div class='products-edit'>
        <div class='content__top-panel'>
          <h1 class='page-title'>
            <a href='/products' class='link'>Товары</a> / Добавить
          </h1>
        </div>
        <div class='content-box' data-element='productForm'></div>
      </div>
    `;
  }

  constructor(match) {
    super();
    this.productId = match[1];
  }

  async initComponents() {
    const productForm = new ProductForm(this.productId);
    await productForm.render();

    this.components.productForm = productForm;
  }

  initEventListeners() {
    this.components.productForm.element.addEventListener('product-saved', event => {
      const router = Router.instance();
      router.navigate(`/products/${event.detail.id}`);

      const notification = new NotificationMessage('Товар добавлен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    });

    this.components.productForm.element.addEventListener('product-updated', () => {
      const notification = new NotificationMessage('Товар сохранен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    });
  }
}
