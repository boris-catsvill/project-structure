export default class DoubleSlider {
  element = null
  subElements = {}

  constructor({
                min = 0,
                max = 200,
                selected = {from: min, to: max},
                formatValue = value => '$' + value
              } = {}) {
    this.min = min
    this.max = max
    this.selected = selected
    this.formatValue = formatValue
    this.render()
  }

  render() {
    const wrapperElement = document.createElement('div')
    wrapperElement.innerHTML = `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div data-element="slider" class="range-slider__inner">
          <span data-element="progressBar" class="range-slider__progress"></span>
          <span data-element="leftThumb" class="range-slider__thumb-left"></span>
          <span data-element="rightThumb" class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </span>`

    this.element = wrapperElement.firstElementChild
    this.subElements = this.getSubElements(this.element)
    this.setPreselectedRange()
    this.initEventListener()
  }

  setPreselectedRange() {
    const leftOffsetPercent = ((this.selected.from - this.min) / (this.max - this.min)) * 100 + '%'
    const rightOffsetPercent = ((this.max - this.selected.to) / (this.max - this.min)) * 100 + '%'
    this.subElements.leftThumb.style.left = leftOffsetPercent
    this.subElements.progressBar.style.left = leftOffsetPercent
    this.subElements.progressBar.style.right = rightOffsetPercent
    this.subElements.rightThumb.style.right = rightOffsetPercent
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement
      return accum
    }, {})
  }

  initEventListener() {
    this.subElements.leftThumb.addEventListener('pointerdown', this.onMouseDown)
    this.subElements.rightThumb.addEventListener('pointerdown', this.onMouseDown)
  }

  onMouseDown = (e) => {
    this.dragging = e.target
    document.addEventListener('pointermove', this.onMouseMove)
    document.addEventListener('pointerup', this.onMouseUp)
  }

  onMouseUp = () => {
    this.dispatchSelectionEvent()
    document.removeEventListener('pointermove', this.onMouseMove)
    document.removeEventListener('pointerup', this.onMouseUp)
  }

  onMouseMove = (e) => {
    e.preventDefault()
    const {leftThumb, rightThumb, slider, progressBar} = this.subElements
    const leftBorder = slider.getBoundingClientRect().left
    const sliderWidth = slider.getBoundingClientRect().width

    if (this.dragging === leftThumb) {
      const rightThumbPosition = ((100 - parseFloat(rightThumb.style.right)) * sliderWidth) / 100
      let newLeft = e.clientX - leftBorder
      if (newLeft < 0) {
        newLeft = 0
      } else if (newLeft > rightThumbPosition) {
        newLeft = rightThumbPosition
      }
      leftThumb.style.left = (newLeft / sliderWidth * 100) + '%'
      progressBar.style.left = (newLeft / sliderWidth * 100) + '%'
      this.selected.from = Math.floor(this.min + (newLeft / sliderWidth) * (this.max - this.min))
      this.subElements.from.textContent = this.formatValue(this.selected.from)

    } else if (this.dragging === rightThumb) {
      const leftThumbPosition = (parseFloat(leftThumb.style.left) * sliderWidth) / 100
      let newRight = e.clientX - leftBorder
      if (newRight < leftThumbPosition) {
        newRight = leftThumbPosition
      } else if (newRight > sliderWidth) {
        newRight = sliderWidth
      }
      rightThumb.style.right = (1 - newRight / sliderWidth) * 100 + '%'
      progressBar.style.right = (1 - newRight / sliderWidth) * 100 + '%'
      this.selected.to = Math.floor(this.min + newRight / sliderWidth * (this.max - this.min))
      this.subElements.to.textContent = this.formatValue(this.selected.to)
    }
  }

  dispatchSelectionEvent = () => {
    const rangeSelectionEvent = new CustomEvent('range-select', {
      bubbles: true,
      detail: {
        from: this.selected.from,
        to: this.selected.to
      }
    })
    this.element.dispatchEvent(rangeSelectionEvent)
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    document.removeEventListener('pointermove', this.onMouseMove)
    document.removeEventListener('pointerup', this.onMouseUp)
    this.element = null
    this.subElements = {}
  }
}
