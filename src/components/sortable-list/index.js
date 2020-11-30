export default class SortableList {
  element = {}
  draggable = null
  placeholder = null
  shiftX = null
  shiftY = null

  constructor({items = []} = {}) {
    this.items = items
    this.render()
    this.initEventListeners()
  }

  render() {
    this.element = document.createElement('ul')
    this.element.classList.add('sortable-list')
    const updatedItems = this.wrapItems(this.items)
    updatedItems.forEach(item => this.element.append(item))
  }

  wrapItems(items) {
    return items.map(item => {
      item.classList.add('sortable-list__item')
      const draggable = item.querySelector('[data-grab-handle]')
      if (!draggable) {
        item.setAttribute('data-grab-handle', '')
      }
      return item
    })
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onMouseDown)
  }

  onMouseDown = (e) => {
    e.target.ondragstart = null
    const deleteField = e.target.closest('.sortable-list__item [data-delete-handle]')
    if (deleteField) {
      const listItem = e.target.closest('.sortable-list__item')
      listItem.remove()
      return
    }

    let draggable = e.target.closest('[data-grab-handle]')
    if (!draggable) {
      return
    }

    draggable = e.target.closest('.sortable-list__item')
    this.shiftX = e.clientX - draggable.getBoundingClientRect().left
    this.shiftY = e.clientY - draggable.getBoundingClientRect().top
    this.createPlaceholder(draggable)
    draggable.style.width = `${draggable.offsetWidth}px`
    draggable.classList.add('sortable-list__item_dragging')
    this.draggable = draggable

    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }


  createPlaceholder = (element) => {
    const placeholder = document.createElement('div')
    placeholder.style.height = `${element.offsetHeight}px`
    placeholder.style.width = `${element.offsetWidth}px`
    placeholder.style.border = '1px solid var(--blue)'
    element.parentElement.insertBefore(placeholder, element)
    this.placeholder = placeholder
  }


  onMouseMove = (e) => {
    e.preventDefault()
    const draggable = this.draggable
    draggable.style.left = `${e.clientX - this.shiftX}px`
    draggable.style.top = `${e.clientY - this.shiftY}px`

    const coordinates = draggable.getBoundingClientRect()
    const draggableCenterX = coordinates.left + coordinates.width / 2
    const draggableCenterY = coordinates.top + coordinates.height / 2
    if (draggableCenterX < 0 || draggableCenterY < 0 ||
      draggableCenterX > document.documentElement.clientWidth - 10 || draggableCenterY > document.documentElement.clientHeight - 10) {
      return
    }

    draggable.style.visibility = 'hidden'
    const droppable = document.elementFromPoint(draggableCenterX, draggableCenterY).closest('.sortable-list__item')
    draggable.style.visibility = 'visible'
    if (droppable) {
      if (droppable.parentElement !== draggable.parentElement) {
        return
      }

      const droppableCenter = droppable.getBoundingClientRect().top + droppable.getBoundingClientRect().height / 2
      if (draggableCenterY < droppableCenter) {
        droppable.parentElement.insertBefore(this.placeholder, droppable)
      } else {
        droppable.parentElement.insertBefore(this.placeholder, droppable.nextElementSibling)
      }
    }
  }

  onMouseUp = () => {
    this.placeholder.parentElement.insertBefore(this.draggable, this.placeholder)
    this.placeholder.remove()
    this.placeholder = null
    this.draggable.classList.remove('sortable-list__item_dragging')
    this.draggable.style.width = ''
    this.draggable.style.left = ''
    this.draggable.style.top = ''
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  remove() {
    this.element.remove()
    this.element = null
  }

  destroy() {
    this.remove()
  }
}
