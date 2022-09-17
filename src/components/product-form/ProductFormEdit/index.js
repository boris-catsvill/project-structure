import { Fields } from "./Fields";

import BaseComponent from "../../BaseComponent"
import ProductFormEditState from "../../../state/ProductFormEditState";

export default class ProductFormEdit extends BaseComponent {
  #elementDOM = null
  #stateManager = null

  onSubmitForm = (event) => {
    event.preventDefault()
    this.#stateManager.saveProduct()
  }

  constructor (stateManager) {
    super()

    if (!(stateManager instanceof ProductFormEditState)) 
      throw new Error('state manager not passed to ProductFormFilter, need in ProductFormEditState')
    
    this.#stateManager = stateManager

    Object.entries(Fields).forEach(([key, field]) => {
      this.addChildrenComponent(key, field) 
    })
  }

  get element() {
    return this.#elementDOM
  }

  async render() {
    const { categories } = await this.#stateManager.loadFormGoods()

    Fields.inputCategorySelect.options = categories.map(category => ({
      value: category.id,
      label: category.title
    }))

    this.#elementDOM = this.createDOMElement(this.template())

    this.renderDOMChildren(this.#elementDOM)
    // this.registerFields()

    this.initEvents()
  }

  remove() {
    this.#elementDOM.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.memoDOM.clear()
  }

  registerFields() {
    Object.values(Fields).forEach((field) => {
      this.#stateManager.registerField(field.name, field.input.value)
    }) 
  }

  initEvents() {
    this.#elementDOM.addEventListener('submit', this.onSubmitForm)

    Object.values(Fields).forEach((inputInstance) => {
      inputInstance.input.oninput = (e) => {
        this.#stateManager.changeField(inputInstance.name, e.target.value)
      }
    })
  }

  setDefaultValues() {
    
  }

  template(productData) {
    return /*html*/`
      <form class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <span data-mount="inputTitle"></span>
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <span data-mount="inputArea"></span>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <span data-mount="inputImage"></span>
        </div>

        <div class="form-group form-group__half_left">
          <span data-mount="inputCategorySelect"></span>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <span data-mount="inputPrice"></span>
          <span data-mount="inputDiscount"></span>
        </div>
        <div class="form-group form-group__part-half">
          <span data-mount="inputQuantity"></span>
        </div>
        <div class="form-group form-group__part-half">
          <span data-mount="inputStatusSelect"></span>
        </div>
        <div class="form-buttons">
          <button 
            data-memo="submit-btn"
            type="submit" 
            name="save" 
            class="button-primary-outline"
          >
            Сохранить товар
          </button>
        </div>
      </form>
    `
  }
}