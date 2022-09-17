import BaseComponent from "../BaseComponent";

export default class InputSelect extends BaseComponent {
  #elementDOM = null

  name = ''
  label = ''
  placeholder = ''
  options = []

  constructor({ label, placeholder, options, name }) {
    super()

    this.label = label
    this.placeholder = placeholder
    this.options = options
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

  remove() {
    this.#elementDOM.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.clearChildrenComponents()
  }

  template() {
    return /*html*/`
      <fieldset>
        <label class="form-label">${this.label}</label>
        
        <select 
          data-memo="input"
          name=${this.name}
          type=${this.type} 
          class="form-control" 
          placeholder=${this.placeholder}
        >
          ${this.templateOptions()}
        </select>
      </fieldset>
    `
  }

  templateOptions() {
    return this.options.map(({ label, value }) => /*html*/`
      <option value="${value}">${label}</option>
    `).join('')
  }
}