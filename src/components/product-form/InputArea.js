import Input from './Input'

export default class InputArea extends Input {

  constructor(props) {
    super(props)
  }

  template() {
    return /*html*/`
      <fieldset>
        <label class="form-label">${this.label}</label>

        <textarea 
          data-memo="input"
          required="${this.required}"
          class="form-control" 
          name="description" 
          placeholder="${this.placeholder}"
        >
        </textarea>
      </fieldset>
    `
  }

}