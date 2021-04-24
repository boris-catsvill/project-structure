import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js';

const URL_PATH = process.env.URL_PATH;

export default class EditPage {
  element;
  subElements = {};
  components = {};
  currentId = '';

  get getTemplate() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
        <h1 class="page-title">
            <a href="/${URL_PATH}products" class="link">Товары</a> / ${this.currentId ? "Редактировать" : "Добавить"} 
          </h1>
        </div>
        <div class="content-box">       
          <div data-element="productForm" class="product-form"></div>
        </div>
      </div>
    `;
  }

  get getId() {
    const { pathname } = location;

    return pathname.match(/products\/add/) ?
      "" :
      pathname.split('/products/')[1];
  }

  get getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]');

    return [...subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  async render() {
    this.currentId = this.getId;

    const element = document.createElement('div');
    element.innerHTML = this.getTemplate;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements;

    await this.initComponents();
    this.renderComponents();

    this.addEventListeners();

    return this.element;
  }

  async initComponents() {
    const productForm = new ProductForm(this.currentId);
    await productForm.render();

    this.components = {productForm};
  }

  renderComponents() {
    Object.entries(this.components).forEach(([title, component]) => {
      const container = this.subElements[title];

      container.append(component.element);
    });
  }

  renderNotification(message) {
    const notification = new NotificationMessage(message);
    notification.show();
  }

  addEventListeners() {
    const { productForm } = this.components;

    productForm.element.addEventListener('product-saved', () => {
      this.renderNotification('Товар добавлен!');
    });

    productForm.element.addEventListener('product-updated', () => {
      this.renderNotification('Товар обновлен!');
    });
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