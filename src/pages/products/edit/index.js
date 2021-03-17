import ProductForm from '../../../components/product-form/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  constructor(productID = '') {
    this.productID = productID;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    wrapper.remove();

    this.loadForm();
  }

  loadForm() {
    const productForm = new ProductForm(this.productID);
    
    const renderForm = async () => {
      await productForm.render();
  
      productForm.element.addEventListener('product-saved', event => {
        console.error('product-saved', event.detail);
      });
  
      productForm.element.addEventListener('product-updated', event => {
        console.error('product-updated', event.detail);
      })
  
      this.element.querySelector('.content-box').append(productForm.element);
    };
  
    renderForm();
  }

  getTemplate() {
    return `
        <div class="products-edit">
            <div class="content__top-panel">
                <h1 class="page-title">
                  <a href="/products" class="link">Товары</a> / Редактировать
                </h1>
            </div>
            <div class="content-box"></div>
        </div>
    `;
  }
} 