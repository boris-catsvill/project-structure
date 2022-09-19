import { productFormAddState } from "../../../state/ProductFormState";

import BaseComponent from "../../../components/BaseComponent";
import ProductForm from "../../../components/product-form/ProductForm";

const productForm = new ProductForm({
  clearAfterSend: true
}, productFormAddState)

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