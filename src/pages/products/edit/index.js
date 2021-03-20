import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor([_, productId]) {
    this.productId = productId;
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / Редактировать
          </h1>
        </div>
        <div class="content-box" data-element="productForm"></div>
      </div>
    `;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    await this.initComponents();
    this.renderComponents();
    this.initEventListners();

    return this.element;
  }

  async initComponents() {
    const productForm = new ProductForm(this.productId);
    await productForm.render();

    this.components = {
      productForm,
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListners() {
    const savedNotification = new NotificationMessage('Товар добавлен', { duration: 2000, type: 'success' });
    this.element.addEventListener('product-saved', event => {
      savedNotification.show();
    });

    const updatedNotification = new NotificationMessage('Товар сохранен', { duration: 2000, type: 'success' });
    this.element.addEventListener('product-updated', event => {
      updatedNotification.show();
    });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.remove();

    this.element = null;
    this.subElements = null;
    this.components = null;
  }
}
