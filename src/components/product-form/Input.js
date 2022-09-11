import BaseComponent from "../BaseComponent";

export default class Input extends BaseComponent {
  name = ''
  label = ''
  placeholder = ''
  type = 'text'

  #elementDOM = null

  constructor({ 
    label = '', 
    placeholder = '', 
    type = 'text',
    name = '' 
  }) {
    super()
    this.label = label
    this.placeholder = placeholder
    this.type = type
    this.name = name
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
      <div class="form-group">
        <label class="form-label">${this.label}</label>
        <br/>
        <input 
          data-memo="input"
          type=${this.type} 
          class="form-control" 
          placeholder=${this.placeholder} 
          name=${this.name}
        />
      </div>
    `
  }
}