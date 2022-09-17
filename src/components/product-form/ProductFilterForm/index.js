import { getFields } from "./Fields";
import BaseComponent from "../../BaseComponent";
import FormEventState from "../../../state/FormEventState";

export default class ProductFilterForm extends BaseComponent {
  #elementDOM = null

  #stateManager = null

  fields = null

  constructor(stateManager) {
    super()

    if (!(stateManager instanceof FormEventState)) 
      throw new Error('state manager not passed to ProductFormFilter, need in FormEventState')

    this.#stateManager = stateManager

    this.fields = getFields()

    Object.entries(this.fields).forEach(([key, field]) => {
      this.addChildrenComponent(key, field) 
    })
  }

  get element() {
    return this.#elementDOM
  }

  render() {
    this.#elementDOM = this.createDOMElement(this.template())

    this.renderDOMChildren(this.#elementDOM)

    this.registerFields()

    this.initEvents()
  }

  remove() {
    this.#elementDOM.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.clearChildrenComponents()
  }

  registerFields() {
    Object.values(this.fields).forEach((field) => {
      this.#stateManager.registerField(field.name, field.input.value)
    }) 
  }

  initEvents() {
    Object.entries(this.DOMChildren).forEach(([inputKey, inputInstance]) => {
      if (!inputKey.startsWith('input')) return
      inputInstance.input.oninput = (e) => {
        this.#stateManager.changeField(inputInstance.name, e.target.value)
      }
    })
  }

  template() {
    return /*html*/`
      <form class="form-inline">
        <span data-mount="inputTitle"></span>
        <span data-mount="inputPriceFrom"></span>
        <span data-mount="inputPriceTo"></span>
        <span data-mount="inputStatus"></span>
      </form>
    `
  }

}