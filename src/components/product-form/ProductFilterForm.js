import BaseComponent from "../BaseComponent";
import Input from './Input'
import InputSelect from "./InputSelect";
import FormEventState from "../../state/FormEventState";

const inputTitle = new Input({ 
  name: 'title',
  label: 'Сортировать по:', 
  placeholder: 'Название товара' 
})
const inputPriceFrom = new Input({ 
  name: 'priceFrom',
  label: 'Цена от:', 
  placeholder: '00.00',
  type: 'number' 
})
const inputPriceTo = new Input({ 
  name: 'priceTo',
  label: 'До:', 
  placeholder: '00.00',
  type: 'number' 
})
const inputStatus = new InputSelect({
  name: 'status',
  label: 'Статус:',
  options: [
    { label: 'Любой', value: '' },
    { label: 'Активный', value: '1' },
    { label: 'Неактивный', value: '0' }
  ]
})

export default class ProductFilterForm extends BaseComponent {
  #elementDOM = null

  #stateManager = null

  constructor(stateManager) {
    super()

    if (!(stateManager instanceof FormEventState)) 
      throw new Error('state manager not passed to ProductFormFilter, need in FormEventState')

    this.#stateManager = stateManager
    this.addChildrenComponent('inputTitle', inputTitle)
    this.addChildrenComponent('inputPriceFrom', inputPriceFrom)
    this.addChildrenComponent('inputPriceTo', inputPriceTo)
    this.addChildrenComponent('inputStatus', inputStatus)
  }

  get element() {
    return this.#elementDOM
  }

  render() {
    this.#elementDOM = this.createDOMElement(this.template())

    this.renderDOMChildren(this.#elementDOM)

    this.initFormValues()

    this.initEvents()
  }

  initFormValues() {
    this.#stateManager.registerField(inputTitle.name, inputTitle.input.value)
    this.#stateManager.registerField(inputPriceFrom.name, inputPriceFrom.input.value)
    this.#stateManager.registerField(inputPriceTo.name, inputPriceTo.input.value)
    this.#stateManager.registerField(inputStatus.name, inputStatus.input.value)
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