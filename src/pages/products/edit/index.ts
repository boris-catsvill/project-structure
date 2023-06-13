import ProductForm from '../../../components/product-form';
import { getPageLink, Menu } from '../../../components/sidebar/menu';
import { successNotice } from '../../../components/notification';
import { ROUTER_LINK } from '../../../router/router-link';
import { navigate } from '../../../router';
import { IPage, TypeComponents, TypeSubElements } from '../../../types/base';
import { BasePage } from '../../../base-page';
import { CUSTOM_EVENTS } from '../../../constants';

enum ComponentsEnum {
  ProductForm = 'productForm'
}

type EditProductComponents = {
  [ComponentsEnum.ProductForm]: ProductForm;
};

export default class Page extends BasePage implements IPage {
  element: Element;
  subElements: TypeSubElements<EditProductComponents>;
  components: TypeComponents<EditProductComponents>;
  productId: string;

  constructor({ productId = '' } = {}) {
    super();
    this.productId = productId;
  }

  get type() {
    return Menu.products.page;
  }

  get template() {
    return `<div class='products-edit'>
      <div class='content__top-panel'>
        <h1 class='page-title'>${this.getTitle()}</h1>
      </div>
      <div class='content-box' data-element='${ComponentsEnum.ProductForm}'></div>
    </div>`;
  }

  getTitle() {
    return `<a href='${getPageLink('products')}' is='${ROUTER_LINK}' class='link'>Products</a> / ${
      this.productId ? 'Edit' : 'Add'
    }`;
  }

  async render() {
    super.render();
    this.initComponents();
    await this.renderComponents();
    this.initListeners();
    return this.element;
  }

  onProductAdded(e: CustomEvent) {
    const { id: productId } = e.detail;
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
    productForm.element.addEventListener(CUSTOM_EVENTS.UpdateProduct, () =>
      successNotice('Product Updated')
    );
    productForm.element.addEventListener(CUSTOM_EVENTS.AddProduct, ((e: CustomEvent) =>
      this.onProductAdded(e)) as EventListener);
  }
}
