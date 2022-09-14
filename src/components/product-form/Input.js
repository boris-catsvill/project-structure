import BaseComponent from "../BaseComponent";

export default class Input extends BaseComponent {
  #elementDOM = null

  constructor({ 
    name = '',
    label = '', 
    placeholder = '', 
    type = 'text',
    required = false
  }) {
    super()
    this.name = name
    this.label = label
    this.placeholder = placeholder
    this.type = type
    this.required = required
  }

  get element() {
    return this.#elementDOM
  }
  
  get input() {
    return this.memoDOM.cache.input
  }

  render() {
    this.#elementDOM = this.createDOMElement(this.template())

    this.memoDOM.memoizeDocument(this.#elementDOM)
  }

  template() {
    return /*html*/`
      <fieldset>
        <label class="form-label">${this.label}</label>
       
        <input 
          data-memo="input"
          type=${this.type} 
          class="form-control" 
          placeholder=${this.placeholder} 
          name=${this.name}
        />
      </fieldset>
    `
  }
}