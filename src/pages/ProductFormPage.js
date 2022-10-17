import ProductForm from "../components/ProductForm.js";

export default class ProductFormPage {
    subElements= {}
    element = null

    constructor({mainClass, productId, urls}) {

      this.productId = productId;
      this.mainClass = mainClass;
      this.Constructor = ProductForm;

      this.urlsForAJAX = {
        categoriesURL: (new URL(urls['/categories'][0], urls['backendURL'])),
        productURL: (new URL(urls['/products'], urls['backendURL'])),
        imageURL: '3/image'
      };
      this.render();
    }

    get ProductFormElement() {
      const wrapper = document.createElement('div');
      const bodyOfWrapper = `
        <div class="products-edit">
          <div class="content__top-panel">
            <h1 class="page-title">
              <a href="/products" class="link">Товары</a> / ${this.productId ? 'Редактировать' : 'Создать'}
            </h1>
          </div>
          <div class="contentBox" data-element="contentBox"></div>
        </div>`;
      wrapper.innerHTML = bodyOfWrapper;
      return wrapper.firstElementChild;
    }

    setSubElements() {
      const elements = this.element.querySelectorAll('[data-element]');

      for (const element of elements) {
        const name = element.dataset.element;
        this.subElements[name] = element;
      }
    }

    setWrapperOfElementHTML() {
      this.wrapperOfElementHTML = new this.Constructor(this.productId, this.urlsForAJAX);
    }
  
    async update() {
      this.mainClass.toggleProgressbar();
      const { contentBox } = this.subElements;

      this.setWrapperOfElementHTML();
      
      const element = await this.wrapperOfElementHTML.render();

      contentBox.append(element);
  
      this.mainClass.toggleProgressbar();
    }

    async render() {
      this.element = this.ProductFormElement;
      this.setSubElements();
      await this.update();
  
      return this.element;
    }

    remove() {
      this.element.remove();
      this.element = null;
    }

    destroy() {
      this.wrapperOfElementHTML.destroy();
      this.remove();
    }
}