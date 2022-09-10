import MemoDOM from '../utils/MemoDom'

export default class BaseComponent {
  memoDOM = new MemoDOM()
  #DOMChildren = {}

  get DOMChildren() {
    return this.#DOMChildren
  }

  createDOMElement(strHTML = "") {
    const wrapper = document.createElement("div")
    wrapper.innerHTML = strHTML
    return wrapper.firstElementChild
  }

  renderDOMChildren(elementDOM) {
    const renderPlace = elementDOM.querySelectorAll('[data-mount]')

    renderPlace.forEach(elem => {
      const component = elem.dataset.mount
      const componentInstance = this.#DOMChildren[component]
      componentInstance.render()
      elem.replaceWith(componentInstance.element)
    })
  }

  setDOMChildren(tree = {}) {
    this.#DOMChildren = tree
  }

  addChildrenComponent(componentMarker, component) {
    this.#DOMChildren[componentMarker] = component
  }

  removeChildrenComponent(componentMarker) {
    this.#DOMChildren[componentMarker] = null
  }

  clearChildrenComponents() {
    this.#DOMChildren = {}
  }
}