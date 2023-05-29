import { INodeListOfSubElements, IPage, SubElementsType } from '../../../types';
import menu from '../../../components/sidebar/menu';
import ProductForm from '../../../components/product-form';

export default class Page implements IPage {
  element: Element | null;
  subElements = {};
  components = {};
  productId;

  constructor({ productId = '' } = {}) {
    this.productId = productId;
  }

  get type() {
    return menu.products.page;
  }

  get template() {
    return `<div class='products-edit'>
      <div class='content__top-panel'>
        <h1 class='page-title'>${this.getTitle()}</h1>
      </div>
      <div class='content-box' data-element='productForm'></div>
    </div>`;
  }

  getTitle() {
    return `<a href='${menu.products.href}' class='link'>Products</a> 
          / ${this.productId ? 'Edit' : 'Add'}`;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild!;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    this.renderComponents();
    return this.element;
  }

  getSubElements(element: Element) {
    const elements: INodeListOfSubElements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => {
      const elementName = el.dataset.element;
      acc[elementName] = el;
      return acc;
    }, {} as SubElementsType);
  }

  renderComponents() {
    Object.keys(this.components).forEach(async component => {
      // @ts-ignore
      const root = this.subElements[component];
      // @ts-ignore
      const element = await this.components[component].render();

      root.append(element);
    });
  }

  initComponents() {
    const productForm = new ProductForm(this.productId);
    this.components = { productForm };
  }

  remove() {
    if (this.element) {
      this.element = null;
    }
  }

  destroy() {
    this.remove();
  }
}
