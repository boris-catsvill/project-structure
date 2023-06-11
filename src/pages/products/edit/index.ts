import { HTMLDatasetElement, IPage } from '../../../types';
import ProductForm from '../../../components/product-form';
import { getPageLink, menu } from '../../../components/sidebar/menu';
import { successNotice } from '../../../components/notification';
import { ROUTER_LINK } from '../../../router/router-link';
import { navigate } from '../../../router';

enum Components {
  ProductForm = 'productForm'
}

type EditProductComponents = {
  [Components.ProductForm]: ProductForm;
};

type SubElements = {
  [K in keyof EditProductComponents]: HTMLElement;
};

export default class Page implements IPage {
  element: Element;
  subElements: SubElements;
  components: EditProductComponents;
  productId: string;

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
    return `<a href='${getPageLink('products')}' is='${ROUTER_LINK}' class='link'>Products</a> / ${
      this.productId ? 'Edit' : 'Add'
    }`;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild as HTMLElement;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    await this.renderComponents();
    this.initListeners();
    return this.element;
  }

  getSubElements(element: Element) {
    const elements: NodeListOf<HTMLDatasetElement<SubElements>> =
      element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => {
      const elementName = el.dataset.element;
      acc[elementName] = el;
      return acc;
    }, {} as SubElements);
  }

  onProductAdded({ detail }: CustomEvent) {
    const { id: productId } = detail;
    successNotice('Product Added');
    navigate(`${getPageLink('products')}/${productId}`);
  }

  async renderComponents() {
    const isPromise = (result: any) => result instanceof Promise;
    await Promise.all(
      (Object.keys(this.components) as (keyof EditProductComponents)[]).map(async componentName => {
        const root = this.subElements[componentName];
        const component = this.components[componentName];
        /**
         * If (component.element === undefined) - call the render();
         * render() can return - (Promise || element || undefined);
         * result === (element OR undefined) || (Promise resolved with  (element || undefined));
         * even if (resolved Promise) === undefined,
         * element = component.Element because render() was called and (component.element !== undefined)
         *
         * P.S May be this is complex. I tried to cover cases like this:
         * - render() was not called in component
         * - render() NOT async AND return element
         * - render() NOT async NOT return element
         * - render() async AND return element
         * - render() async NOT return element
         */
        const result = component.element || component.render();
        const element = await (isPromise(result) ? result : Promise.resolve(result));

        root.append(element || component.element);
      })
    );
  }

  initComponents() {
    const productForm = new ProductForm(this.productId);
    this.components = { productForm };
  }

  initListeners() {
    const { productForm } = this.components;
    productForm.element.addEventListener(ProductForm.EVENT_UPDATED, () =>
      successNotice('Product Updated')
    );
    productForm.element.addEventListener(ProductForm.EVENT_ADDED, (e: CustomEvent) =>
      this.onProductAdded(e)
    );
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
