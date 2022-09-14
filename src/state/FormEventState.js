import BaseEventState from "./BaseEventState";
import fetchJson from "../utils/fetch-json";

export default class FormEventState extends BaseEventState {
  formState = {}

  constructor() {
    super()
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
