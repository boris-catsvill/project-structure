import BaseComponent from '../BaseComponent'
import TableEventState from '../../state/TableEventState'

export default class SortableTable extends BaseComponent {
  #elementDOM = null

  headerConfig = []
  sorted = {}
  lazyLoadItems = 30

  stateManager = null

  updateTableBody = () => {
    this.memoDOM.cache.body.innerHTML = this.templateBody()
  }

  onWindowScroll = async () => {
    const { bottom } = this.#elementDOM.getBoundingClientRect()
    const { clientHeight } = document.documentElement

    if (this.isLoading) return
    if (bottom >= clientHeight) return
    if (this.isSortLocally) return

    this.loadMoreData()
  }

  onSortClick = (event) => {
    const col = event.target.closest('[data-sortable=true]')
    if (!col) return 

    const { id, order } = col.dataset
    const changerOrder = { asc: 'desc', desc: 'asc' }
    this.sorted = { 
      fieldValue: id, 
      orderValue: order ? changerOrder[order] : 'asc'
    }

    this.showSortArrow()

    if (this.isSortLocally) {
      this.stateManager.updateDataLocalSort(this.sorted, this.headerConfig)
      return
    }

    this.stateManager.updateData({ 
      ...this.sorted,
      _start: 0,
      end: this.lazyLoadItems
    }, true)
  }

  constructor({ 
    headerConfig = [],
    sorted = { fieldValue: null, orderValue: null }, 
    isSortLocally = false,
    isLazyLoad = true
  }, stateManager) {
    super()

    if (!(stateManager instanceof TableEventState)) 
      throw new Error('state manager not passed to SortableTable, need in TableEventState')

    this.headerConfig = headerConfig
    this.sorted = sorted
    this.isSortLocally = isSortLocally
    this.isLazyLoad = isLazyLoad

    this.stateManager = stateManager
  }

  get element() {
    return this.#elementDOM
  }

  render() {
    this.#elementDOM = this.createDOMElement(this.template())
    this.memoDOM.memoizeDocument(this.#elementDOM)
    this.initEvents()
  }

  remove() {
    this.#elementDOM?.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.headerConfig = null
    this.data = null

    this.memoDOM.clear()
    this.removeEvents()
  }

  updateTableRange = async (from, to) => {
    const { orderValue: _order, fieldValue: _sort } = this.sorted
    await this.stateManager.updateData({ 
      _sort,
      _order,
      _start: 0,
      end: this.lazyLoadItems,
      from,
      to
    }, true)
  }

  showSortArrow() {
    const { fieldValue, orderValue } = this.sorted
    const cacheDOM = this.memoDOM.cache

    Object.entries(cacheDOM).forEach(([elemKey, elemDOM]) => {
      if (elemKey === `sort-cell-${fieldValue}`) {
        elemDOM.dataset.order = orderValue
        return
      }
      if (elemKey.startsWith('sort-cell'))
        elemDOM.dataset.order = ''
    })
  }

  template() {
    return /*html*/`
      <div class="sortable-table">

        <div data-memo="header" class="sortable-table__header sortable-table__row">
          ${this.templateHeader()}
        </div>
        
        <div data-memo="body" class="sortable-table__body">
          ${this.templateBody()}
        </div>
      </div>
    `
  }

  templateHeader() {
    return this.headerConfig.map(({ id, title, sortable } = {}) => (
      /*html*/`
      <div 
        class="sortable-table__cell"
        data-memo="sort-cell-${id}"
        data-id="${id}" 
        data-sortable="${sortable}" 
        data-order="${
          this.sorted.fieldValue === id 
            ? this.sorted.orderValue 
            : ''
        }"
      >
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`
    )).join('') 
  }

  templateBody() {
    const buildData = this.stateManager.data
    return buildData.map((product) => this.templateRow(product)).join('')
  }

  templateRow(product) {
    const row = this.headerConfig.map((col) => {
      if (!product[col.id]) return
      if (col.template) return col.template(product[col.id])
      return /*html*/`
        <div class="sortable-table__cell">${product[col.id]}</div>
      `
    }).join("")

    return /*html*/`
      <a href="/products/${product.id}" class="sortable-table__row">
        ${row}
      </a>
    `
  }

  initEvents() {
    this.memoDOM.cache.header.addEventListener('click', this.onSortClick)

    if (this.isLazyLoad)
      window.addEventListener('scroll', this.onWindowScroll)

    this.stateManager.on('updateData', this.updateTableBody)
  }

  removeEvents() {
    this.stateManager.removeListener('updateData', this.updateTableBody)
    window.removeEventListener('scroll', this.onWindowScroll)
  }
}
