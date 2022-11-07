import ProductForm from "../../../components/product-form";

export default class AddProductPage {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    await this.createComponents();
    this.renderComponents();
    return this.element;
  }

  getTemplate() {
    return `
        <div class="products-edit">
            <div class="content__top-panel">
                <h1 class="page-title">
                    <a href="/products" class="link">Товары</a> / Добавить
                </h1>
            </div>
            <div data-element="productForm" class="content-box">
            </div>
        </div>
    `;
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
    Object.values(this.components).forEach(value => value.destroy());
    this.components = null;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  async createComponents() {
    const id = window.location.pathname.split('/').at(-1);
    const productForm = new ProductForm(id);
    await productForm.render();
    this.components = {productForm};
  }

  renderComponents() {
    Object.entries(this.components).forEach(([name, component]) => {
      const subElement = this.subElements[name];
      if (!subElement) {
        return;
      }
      subElement.append(component.element);
    });
  }
}
