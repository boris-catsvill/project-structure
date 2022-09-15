import { Fields } from "./Fields";
import BaseComponent from "../../BaseComponent";
import FormEventState from "../../../state/FormEventState";

export default class ProductFilterForm extends BaseComponent {
  #elementDOM = null

  #stateManager = null

  constructor(stateManager) {
    super()

    if (!(stateManager instanceof FormEventState)) 
      throw new Error('state manager not passed to ProductFormFilter, need in FormEventState')

    this.#stateManager = stateManager

    Object.entries(Fields).forEach(([key, field]) => {
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

  registerFields() {
    Object.values(Fields).forEach((field) => {
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