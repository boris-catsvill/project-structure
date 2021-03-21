import ProductForm from "../../../components/product-form";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="products-edit">
          <div class="content__top-panel">
              <h1 class="page-title">
                <a href="/products" class="link">Товары</a> / Редактировать
              </h1>
          </div>
          <div class="content-box"></div>
      </div>
    `;

    this.element = element.firstElementChild;

    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  initComponents() {
    const pathname = window.location.pathname;
		const productId = !pathname.endsWith('/add') ? pathname.slice(pathname.lastIndexOf('/') + 1) : '';

    this.components.productFrom = new ProductForm(productId);
  }

  async renderComponents() {
    const form = await this.components.productFrom.render();

    this.element.querySelector('.content-box').append(form);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
