import getFields from "./getFields";
import NotificationMessage from "../../notification";
import BaseComponent from "../../BaseComponent"
import ProductFormEditState, { PRODUCT_FORM_ACTIONS} from "../../../state/ProductFormState";

export default class ProductForm extends BaseComponent {
  #elementDOM = null
  #stateManager = null

  fields = null

  clearAfterSend = false

  onSubmitForm = (event) => {
    event.preventDefault()
    this.#stateManager.saveProduct()
  }

  onSaveProductFail = () => {
    const notification = new NotificationMessage(
      this.#stateManager.productId 
        ? 'Не удалось обновить товар'
        : 'Не удалось добавить товар'
      , 
      {
        duration: 5000,
        type: 'error'
      }
    )

    notification.show()
  }

  onSaveProductSuccess = () => {
    const notification = new NotificationMessage(
      this.#stateManager.productId 
        ? 'Товар обновлен' 
        : 'Товар добавлен', 
      {
        duration: 5000,
        type: 'success'
      }
    )

    notification.show()

    if (!this.clearAfterSend) return
    this.#stateManager.clearForm()
    this.registerFields()
    
    const { inputImage } = this.fields
    inputImage.stateManager.clearFiles()
  }

  constructor ({
    clearAfterSend = false
  }, stateManager) {
    super()

    if (!(stateManager instanceof ProductFormEditState)) 
      throw new Error('state manager not passed to ProductFormFilter, need in ProductFormEditState')
    
    this.#stateManager = stateManager

    this.clearAfterSend = clearAfterSend
    this.fields = getFields()

    Object.entries(this.fields).forEach(([key, field]) => {
      this.addChildrenComponent(key, field) 
    })
  }

  get element() {
    return this.#elementDOM
  }

  async render() {
    const { inputCategorySelect } = this.DOMChildren
    const { categories } = await this.#stateManager.loadFormGoods()

    inputCategorySelect.options = categories.map(category => ({
      value: category.id,
      label: category.title
    }))

    this.#elementDOM = this.createDOMElement(this.template())

    this.renderDOMChildren(this.#elementDOM)
    this.memoDOM.memoizeDocument(this.#elementDOM)
    this.registerFields()

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
    const { formState } = this.#stateManager
    Object.values(this.fields).forEach((field) => {
      const defaultValue = formState[field.name]
      if (defaultValue === undefined) {
        field.input.value = null
        return
      }
      field.input.value = defaultValue
    }) 

    const { inputImage } = this.fields
    const files = formState[inputImage.name]
    inputImage.stateManager.updateDefaultFiles(files)
  }

  initEvents() {
    this.#elementDOM.addEventListener('submit', this.onSubmitForm)
    this.#stateManager.on(
      PRODUCT_FORM_ACTIONS.saveProductSuccess, 
      this.onSaveProductSuccess
    )
    this.#stateManager.on(
      PRODUCT_FORM_ACTIONS.saveProductFail,
      this.onSaveProductFail
    )

    Object.values(this.fields).forEach((inputInstance) => {
      inputInstance.input.oninput = (e) => {
        this.#stateManager.changeField(inputInstance.name, e.target.value)
      }
    })
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