class Tooltip {
  element = null

  constructor() {
    this.element = document.createElement('div')
    this.element.classList.add('tooltip')
  }

  render(innerText = '') {
    this.element.textContent = innerText
    const body = document.querySelector('body')
    body.appendChild(this.element)
  }

  initialize() {

    const moveTooltip = moveEvent => {
      this.element.style.left = (moveEvent.clientX + 10) + 'px'
      this.element.style.top = (moveEvent.clientY + 10) + 'px'
    }

    document.addEventListener('pointerover', (e) => {
      if (e.target.dataset.tooltip !== undefined) {
        this.render(e.target.dataset.tooltip)
        document.addEventListener('mousemove', moveTooltip)
      }
    })

    document.addEventListener('pointerout', (e) => {
      if (e.target.dataset.tooltip !== undefined) {
        document.removeEventListener('mousemove', moveTooltip)
        this.remove()
      }
    })
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.element.remove()
  }
}

const tooltip = new Tooltip();

export default tooltip;
