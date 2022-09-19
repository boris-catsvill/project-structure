import BaseEventState from "./BaseEventState";

export default class FormEventState extends BaseEventState {
  formState = {}

  constructor() {
    super()
  }

  clearForm () {
    this.formState = {}
  }

  registerField(fieldName, defaultValue) {
    this.formState[fieldName] = defaultValue
  }

  changeField(fieldName, value) {
    this.formState[fieldName] = value
    this.dispatchEvent('changeField')
  }
}

export const productFormFilterState = new FormEventState()
