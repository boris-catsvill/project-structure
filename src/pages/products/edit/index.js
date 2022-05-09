import fetchJson from '../../../utils/fetch-json.js';
import ProductForm from '../../../components/product-form/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ProductEditPage {
  subelements = {}
  componentsObject = {}
  static getIdFromUrlPath (href) {
    const url = new URL(href);
    const pathArray = url.pathname.split('/');
    if (pathArray[pathArray.length - 1] === 'add') {
      return;
    } else {
      return pathArray[pathArray.length - 1];
    }
  }

  async render () {
    const id = ProductEditPage.getIdFromUrlPath(window.location.href);
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate(id);
    this.element = div.firstElementChild;
    this.componentsObject['productForm'] = new ProductForm(id);
    const {productForm} = this.componentsObject;
    await productForm.render();
    this.element.querySelector('.content-box').append(productForm.element);
    this.subelements = this.getSubelements();
    return this.element;
  }

  getTemplate (id) {
    return `
    <div class="products-edit">
          <div class="content__top-panel">
            <h1 class="page-title">
                 <a href="/products" class="link">Товары</a> / ${id ? 'Редактировать' : 'Добавить'}
            </h1>
        </div>
        <div class="content-box">

        </div>

    </div>
    `;
  }

  getSubelements () {
    const subs = {};
    const subsList = this.element.querySelectorAll('[data-element]');

    for (const element of subsList) {
      subs[element.dataset.element] = element;
    }

    return subs;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    for (const component in this.componentsObject) {
      this.componentsObject[component].destroy();
    }
    this.componentsObject = null;
    this.subelements = null;
  }

}
