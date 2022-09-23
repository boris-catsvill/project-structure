export const SORT_LIST_ACTIONS = {
  sortlist: 'sortlist'
}

export default class SortableList {
  #elemenetDOM = null
  items = []

  draggingLi = null

  droppableLi = null

  placeholderLi = null

  shiftPoint = { x: 0, y: 0 }  

  onPointerMove = (event) => {
    this.moveDragElement(event)
    this.scrollIfCloseToWindowEdge(event)

    const droppableLi = this.findDroppableArea(event)
    const isCursorInList = this.isCursorInListArea(event)

    if (!isCursorInList) return
    if (!droppableLi) return
    this.droppableLi = droppableLi

    this.swapElements(this.placeholderLi, droppableLi)
  }

  onMouseUp = () => {    
    this.removeDocumentListeners()
    this.makeLiUnDraggable()

    this.placeholderLi?.replaceWith(this.draggingLi)
    this.placeholderLi?.remove()
    this.placeholderLi = null

    this.#elemenetDOM.dispatchEvent(new Event(SORT_LIST_ACTIONS.sortlist))
  }

  onMouseDown = (event) => {
    event.preventDefault()

    const li = event.target.closest('[data-draggable]')
    const isDragAction = !!event.target.closest('[data-grab-handle]')
    const isRemoveAction = !!event.target.closest('[data-delete-handle]')

    if (!li) return
    if (isDragAction) this.startDragEvent(li, event)
    if (isRemoveAction) li.remove()
  }

  startDragEvent(liItem, event) {
    this.draggingLi = liItem
    this.initLiShiftPoint(liItem, event)    

    this.mountPlaceholder()
    this.makeLiDraggable()
    
    this.moveDragElement(event)
    this.initDocumentListeners()
  }

  mountPlaceholder() {
    const placeholderWidth = this.draggingLi.clientWidth
    const placeholderHeight = this.draggingLi.clientHeight
    this.placeholderLi = this.createPlaceholderLi(placeholderWidth, placeholderHeight)
    this.draggingLi.after(this.placeholderLi)
  }

  makeLiDraggable() {
    const { offsetWidth, offsetHeight } = this.draggingLi

    this.draggingLi.style.width = offsetWidth + 'px'
    this.draggingLi.style.height = offsetHeight + 'px'

    this.draggingLi.classList.add('sortable-list__item_dragging')

    this.draggingLi.onmouseup = this.onMouseUp
  }

  makeLiUnDraggable() {
    this.draggingLi.classList.remove('sortable-list__item_dragging')
    this.draggingLi.setAttribute('style', '')
    this.draggingLi.onmouseup = null
  }

  initLiShiftPoint(liItem, { clientX, clientY }) {
    const { x, y } = liItem.getBoundingClientRect()
    this.shiftPoint = { 
      x: clientX - x,
      y: clientY - y
    }
  }

  initDocumentListeners() {
    document.addEventListener('pointermove', this.onPointerMove)
    document.addEventListener('pointerleave', this.onMouseUp)
  }

  removeDocumentListeners() {
    document.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('pointerleave', this.onMouseUp)
  }

  moveDragElement({ clientX, clientY }) {
    const { x: shiftX, y: shiftY } = this.shiftPoint
    this.draggingLi.style.left = clientX - shiftX + 'px'
    this.draggingLi.style.top = clientY - shiftY + 'px'
  }

  isCursorInListArea({ clientX, clientY }) {
    const { x, y, height, width } = this.#elemenetDOM.getBoundingClientRect()
    if (clientX < x) return false
    if (clientX > (x + width)) return false
    if (clientY < y) return false
    if (clientY > (y + height)) return false
    return true
  }

  findDroppableArea({ clientX, clientY }) {
    const defaultDisplay = this.draggingLi.style.display
    this.draggingLi.style.display = 'none'
    const placeBelow = document.elementFromPoint(clientX, clientY)
    this.draggingLi.style.display = defaultDisplay
    if (!placeBelow) return null
    return placeBelow.closest('[data-draggable]');
  }

  swapElements(item1, item2, debug) {
    const swapMarker = document.createElement("div")
    swapMarker.classList.add('swapMarker')
    this.#elemenetDOM.insertBefore(swapMarker, item1)
    this.#elemenetDOM.insertBefore(item1, item2)
    this.#elemenetDOM.insertBefore(item2, swapMarker)
    this.#elemenetDOM.removeChild(swapMarker)
  }

  scrollIfCloseToWindowEdge({ clientY }) {
    const scrollingValue = 10
    const treshold = 20

    if (clientY < treshold)
      window.scrollBy(0, -scrollingValue)
    
    if (clientY > document.documentElement.clientHeight - treshold)
      window.scrollBy(0, scrollingValue)
  }

  constructor({ items }) {
    this.items = items
  }
  
  get element() {
    return this.#elemenetDOM
  }

  add(DOMItem) {
    this.#elemenetDOM.append(DOMItem)
  }

  render() {
    const ul = document.createElement('ul')

    ul.classList.add('sortable-list')

    for (const item of this.items) {
      item.classList.add('sortable-list__item')
      item.setAttribute('data-draggable', '')
    }

    ul.append(...this.items)

    this.#elemenetDOM = ul

    this.initEventListener()
  }

  createPlaceholderLi(width, height) {
    const element = document.createElement('li')

    element.className = 'sortable-list__placeholder'
    element.style.width = `${width}px`
    element.style.height = `${height}px`

    return element
  }

  initEventListener() {
    this.#elemenetDOM.addEventListener('mousedown', this.onMouseDown)
  }
}
