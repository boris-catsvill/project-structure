import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js'

export default class Page {

  element;
  subElements = {};
  components = {};

  async initComponents() {

    let productId;

    const pathname = window.location.pathname.split('/')[2]

    if (pathname === 'add') {
      productId = ''
    }
    else {
      productId = pathname
    }

    const productForm = new ProductForm(productId);

    await productForm.render();

    this.components = {
      productForm
    }

    this.subElements.productForm.append(productForm.element)
    this.initEventListeners()
  }

  render() {

    const element = document.createElement('div');

    element.innerHTML = this.template();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(element);

    this.initComponents()

    return this.element
  }

  template() {
    return `
  <div class="products-edit">
		<div class="content__top-panel">
			<h1 class="page-title">
				<a href="/products" class="link">Товары</a> / ${this.productId ? 'Редактировать' : 'Добавить'}
			</h1>
		</div>
		<div class="content-box" data-element="productForm">

		</div>
	</div>
      `
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {

      result[item.dataset.element] = item;
      return result;

    }, {})
  }

  initEventListeners() {

    this.components.productForm.element.addEventListener('product-saved', () => {

      const notification = new NotificationMessage('Товар добавлен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    })

    this.components.productForm.element.addEventListener('product-updated', () => {

      const notification = new NotificationMessage('Товар сохранен', {
        duration: 2000,
        type: 'success'
      });

      notification.show();
    })
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

  }
}
