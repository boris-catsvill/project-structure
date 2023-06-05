import { INodeListOfSubElements, IPage, SubElementsType } from '../../../types';
import { getPageLink, menu } from '../../../components/sidebar/menu';
import ProductForm from '../../../components/product-form';
import { success } from '../../../components/notification';
import Router from '../../../router';

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
    return `<a href='${getPageLink('products')}' class='link'>Products</a> / ${
      this.productId ? 'Edit' : 'Add'
    }`;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild!;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    this.renderComponents();
    //this.initListeners();
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

  // @ts-ignore
  productAdded({ id: productId }) {
    const router = Router.instance();
    document.addEventListener('route', this.onProductAdded);
    router.navigate(`${getPageLink('products')}/${productId}`);
  }

  onProductAdded = () => {
    success('Product Added');
    document.removeEventListener('route', this.onProductAdded);
  };

  async renderComponents() {
    Object.keys(this.components).forEach(async component => {
      // @ts-ignore
      const root = this.subElements[component];
      // @ts-ignore
      const element = await this.components[component].render();
      //TODO Refactor!!!
      this.initListeners();
      root.append(element);
    });
  }

  initComponents() {
    const productForm = new ProductForm(this.productId);
    this.components = { productForm };
  }

  initListeners() {
    //@ts-ignore
    const { productForm } = this.components;
    productForm.element.addEventListener(ProductForm.EVENT_UPDATED, () =>
      success('Product Updated')
    );
    productForm.element.addEventListener(ProductForm.EVENT_ADDED, ({ detail }: CustomEvent) =>
      this.productAdded(detail)
    );
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
