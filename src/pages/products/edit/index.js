import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(match) {
    const pathname = match[0].split('/').pop();
    this.productId = !pathname || pathname === 'add' ? undefined : pathname;
  }

  initComponents() {
    const productForm = new ProductForm(this.productId);
    this.components = { productForm }
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="products-edit" data-role='products'>
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / ${this.productId ? 'Редактировать' : 'Добавить'}
          </h1>
        </div>
        <div class="content-box" data-element='productForm'></div>
      </div>
    `;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    const productFormElement = await this.components.productForm.render();
    this.subElements.productForm.append(productFormElement);
    this.initEventListeners();
    return this.element;
  }

  initEventListeners () {
    this.components.productForm.element.addEventListener("product-saved", () => {
      const notification = new NotificationMessage("Товар добавлен");
      notification.show();
      window.history.pushState({}, undefined, '/products')
      window.history.go();
    });

    this.components.productForm.element.addEventListener("product-updated", () => {
      const notification = new NotificationMessage("Товар сохранен");
      notification.show()
    })

  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
}
