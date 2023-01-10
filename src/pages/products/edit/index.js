import BasicPage from '../../basic-page';
import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification';

/**
 * Product edit page
 */
export default class extends BasicPage {

  constructor(match) {
    super();
    this.productId = match[1];
    this.controller = new AbortController();
  }

  initComponents() {
    const productForm = new ProductForm(this.productId);
    this.components = { productForm };

    document.addEventListener('product-saved', () => {
      const notification = new NotificationMessage('Товар добавлен', { type: 'success' });
      notification.show();
    }, { signal: this.controller.signal });

    document.addEventListener('product-updated', () => {
      const notification = new NotificationMessage('Изменения успешно сохранены', { type: 'success' });
      notification.show();
    }, { signal: this.controller.signal });
  }

  destroy() {
    this.controller.abort();
    super.destroy();
  }

  getTemplate() {
    return `<div class='products-edit'>
  <div class='content__top-panel'>
    <h1 class='page-title'>
      <a href='/products' class='link'>Товары</a> &rsaquo; ${this.productId ? 'Редактировать' : 'Добавить'}
    </h1>
  </div>
  <div class='content-box' data-element='productForm'><!-- ProductForm --></div>
</div>`;
  }
}
