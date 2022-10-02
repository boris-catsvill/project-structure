export default class BaseEventState {
  #eventTrigger = null

  constructor() {
    this.#eventTrigger = document.createElement('div')
  }

  dispatchEvent(eventName) {
    this.#eventTrigger.dispatchEvent(new Event(eventName))
  }

  on(eventName, callback) {
    this.#eventTrigger.addEventListener(eventName, callback)
  }

  removeListener(eventName, callback) {
    this.#eventTrigger.removeEventListener(eventName, callback)
  }
}