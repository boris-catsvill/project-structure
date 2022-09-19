import { productFormEditState } from "../../../state/ProductFormState";

import BaseComponent from "../../../components/BaseComponent";
import ProductForm from "../../../components/product-form/ProductForm";

const productForm = new ProductForm({
  clearAfterSend: false
}, productFormEditState)

export default class extends BaseComponent {
  #elementDOM = null

  constructor() {
    super()

    this.addChildrenComponent('productForm', productForm)
  }

  get element() {
    return this.#elementDOM
  }

  render() {
    const paths = window.location.pathname.split('/')
    const id = paths[paths.length - 1]

    productFormEditState.productId = id

    this.#elementDOM = this.createDOMElement(this.template())

    this.renderDOMChildren(this.#elementDOM)
  }

  template() {
    return /*html*/`
      <div>
        <span data-mount="productForm"></span>
      </div>
    `
  }
}