import ProductForm from '../../../components/product-form/index.js';
import Notification from '../../../components/notification/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(match) {
    this.match = match;
  }
  async initComponents() {
    const editableForm = new ProductForm(this.match && this.match[1]);
    await editableForm.render();

    this.components = {
      editableForm
    };
  }
  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      if (element) root.append(element);
    });
  }
  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / ${
              this.match && this.match[1] ? 'Edit' : 'Add'
            }
          </h1>
        </div>
        <div data-element="editableForm" class="content-box"></div>
      </div>
    `;
  }
  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }
  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  initEventListeners() {
    document.addEventListener('product-updated', () => {
      const notification = new Notification('Changes have been applied successfully', {
        duration: 3000,
        type: 'success'
      });
      notification.show();
    });
    document.addEventListener('product-saved', () => {
      const notification = new Notification('Product has been created successfully', {
        duration: 3000,
        type: 'success'
      });
      notification.show();
    });
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
