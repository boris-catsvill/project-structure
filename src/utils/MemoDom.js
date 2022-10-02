export default class MemoDom {
  #cache = {}

  get cache() {
    return this.#cache
  }

  clear() {
    this.#cache = {}
  }

  memoizeDocument(elementDOM) {
    if (!elementDOM) return
    const elementNeedCache = elementDOM.querySelectorAll('[data-memo]')

    for (const element of elementNeedCache) {
      const key = element.dataset.memo
      this.#cache[key] = element
    }
  }
}