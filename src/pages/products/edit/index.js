import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element = {};
  subElements = {};
  productForm = {};
  isNew = true;
  productId = '';
  controller = new AbortController();

  async render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;

    this.getSubElements();
    this.initListeners();

    return this.element;
  }

  async initComponents() {
    this.productForm = new ProductForm(this.productId);
    await this.productForm.render();
  }
  initListeners() {
    document.addEventListener('route', this.appendHandler, { signal: this.controller.signal });
    this.element.addEventListener('product-saved', this.savedHandler, {
      signal: this.controller.signal
    });
  }

  appendHandler = ({ detail }) => {
    const { match } = detail;
    const id = match['input'].split('/').at(-1);

    if (id !== 'add') {
      this.isNew = false;
      this.productId = id;
    }

    this.initComponents().then(() => {
      this.appendComponents();
    });
  };

  savedHandler = ({ detail }) => {
    this.isNew = false;
    this.productId = detail;

    this.productForm.destroy();
    this.productForm = null;
    this.initComponents().then(() => {
      this.appendComponents();
    });
  };

  appendComponents() {
    this.subElements['productForm'].append(this.productForm.element);
    this.subElements['header'].innerHTML = this.getHeader();
  }

  getSubElements() {
    for (const item of this.element.querySelectorAll('[data-element]')) {
      this.subElements[item.dataset.element] = item;
    }
  }
  getHeader() {
    return `<h1 class="page-title">
    <a href="/products" class="link" >Товары</a> / ${this.isNew ? 'Добавить' : 'Редактировать'}
  </h1>`;
  }
  getTemplate() {
    return `<div class="products-edit">
    <div class="content__top-panel" data-element="header">
    </div>
    <div class="content-box" data-element="productForm"></div>
  </div>`;
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
    this.controller.abort();

    this.productForm.destroy();
    this.productForm = null;
  }
}
