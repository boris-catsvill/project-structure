import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};
  duration = 2000;

  constructor() {
    this.title = '';
    this.id = '';
  }

  get template() {
    return `
    <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / ${this.title}
          </h1>
        </div>
        <div class="content-box" data-element="productForm"></div>
      </div>
      `;
  }

  async initComponents() {
    const productForm = new ProductForm(this.id);
    await productForm.render();

    const notificationAdd = new NotificationMessage('Товар сохранен', {
      duration: this.duration,
      type: 'success'
    });

    const notificationUpd = new NotificationMessage('Товар обновлен', {
      duration: this.duration,
      type: 'success'
    });

    this.components = {
      productForm,
      notificationAdd,
      notificationUpd
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];
      if (root) {
        root.append(element);
      }
    });
  }

  async render(match) {
    const element = document.createElement('div');
    this.id = match[1];
    this.title = this.id ? 'Редактировать' : 'Добавить';

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.components = await this.initComponents().then(() => {
      this.renderComponents();
      this.addListeners(this.components);
    });

    return this.element;
  }

  getSubElements(element) {
    let elements = element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});

  }

  addListeners(components) {
    this.components.productForm.element.addEventListener('product-updated', () => {
      components.notificationUpd.show();
    });

    this.components.productForm.element.addEventListener('product-saved', () => {
      components.notificationAdd.show();
    });

  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
