import ProductForm from '../../../components/product-form/index';

export default class Page {
  element = {};
  subElements = {};
  components = {};

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a>
            / ${/\/products\/add$/.test(location) ? 'Добавить' : 'Редактировать'}
          </h1>
        </div>
        <div class="content-box" data-element="productForm">
        </div>
      </div>
    `;
  }

  render = async () => {
    const wrapper = document.createElement('div');
    wrapper.insertAdjacentHTML('beforeend', this.template);

    this.element = wrapper.firstElementChild;
    this.getSubElements();
    await this.getComponents();
    this.renderComponents();

    return this.element;
  };

  getSubElements = () => {
    this.subElements = [...this.element.querySelectorAll('[data-element]')].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  };

  getComponents = async () => {
    const reg = /\/products\//;
    const location = window.location.pathname;
  
    let productForm = {};
    if (/\/products\/([\w()-]+)$/.test(location)) {
      productForm = new ProductForm(window.location.pathname.replace(reg, ''));
    }
    if (/\/products\/add$/.test(location)) {
      productForm = new ProductForm();
    }

    await productForm.render();

    this.components = {
      productForm,
    };
  };

  renderComponents = () => {
    Object.keys(this.components).forEach(item => {
      this.subElements[item].append(this.components[item].element);
    });
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    Object.values(this.components).forEach(item => item.destroy());
    this.components = null;
    this.subElements = null;
    this.element = null;
  };
}
