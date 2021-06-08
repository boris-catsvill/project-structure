import ProductForm from "../../../components/product-form/index.js";

export default class Page {
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const components = await this.initComponents();
    this.renderComponents(components);
    this.components = components;

    return this.element;
  }

  async initComponents() {
    const pathname = window.location.pathname.replace('/products/', '');
    const productId = pathname !== 'add' ? pathname : null;

    const productForm = new ProductForm(productId);
    await productForm.render();

    return {
      productForm
    };
  }

  renderComponents(components) {
    const keysComponents = Object.keys(components);

    keysComponents.forEach(component => {
      const root = this.subElements[component];
      const { element } = components[component];

      root.append(element);
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  getTemplate() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / Добавить
          </h1>
        </div>
        <div class="content-box">
          <div data-element="productForm"></div>
        </div>
      </div>
    `;
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
