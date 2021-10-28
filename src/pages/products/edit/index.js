import ProductForm from '../../../components/product-form/index.js';
import Notification from '../../../components/notification';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(path) {
    const pathName = path.split('/').pop();

    this.productId = (pathName === 'add') ? null : pathName;
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    this.renderComponents();
    this.initEventListeners();

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
    Object.keys(this.subElements).forEach(key => {
      if (this.components.hasOwnProperty(key)) {
        this.subElements[key].append(this.components[key].element);
      }
    });
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('product-edited', event => {
      this.showNotification('success', 'Product has been edited');
    });

    this.subElements.productForm.addEventListener('product-saved', async (event) => {
      const main = document.querySelector('main');

      main.classList.add('is-loading');

      this.productId =  event.detail.response.id;
      this.setPageTitle('Edit');
      history.pushState(null, null, '/products/' + this.productId);
      await this.components.productForm.switchFromAddToEdit(this.productId);

      main.classList.remove('is-loading');

      this.showNotification('success', 'Product has been saved');
    });
  }

  showNotification(type, message) {
    const notification = new Notification(message, {
      duration: 3000,
      type: type
    });

    notification.show();
  }

  setPageTitle(title) {
    this.subElements.pageTitle.innerHTML = `<a href="/products" class="link">Products</a> / ${title}`;
  }

  get template() {
    const pageName = this.productId ? 'Edit' : 'Add';

    return `<div class="products-edit">
              <div class="content__top-panel">
                <h1 class="page-title" data-element='pageTitle'>
                  <a href="/products" class="link">Products</a> / ${pageName}
                </h1>
              </div>
              <div class="content-box" data-element='productForm'></div>
            </div>`;
  }

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');

    return [...subElements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
