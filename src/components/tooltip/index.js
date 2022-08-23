class Tooltip {
  static classReference;

  constructor() {
    if (Tooltip.classReference) {
      return Tooltip.classReference
    }
    else {
      Tooltip.classReference = this;
    }
  }

  initialize() {
    this.initEventListeners()
  }

  initEventListeners() {
    document.addEventListener('pointerover', (event) => this.addEventMouseOver(event))
    document.addEventListener('pointerout', (event) => this.addEventMouseOut(event))
  }

  addEventMouseOver(event) {
    if (!event.target.dataset.tooltip) return
    this.render()
    this.element.innerHTML = event.target.dataset.tooltip
    this.changeCoordinates(event)
    event.target.addEventListener('pointermove', (event) => this.changeCoordinates(event));
    document.addEventListener('pointerout', (event) => this.addEventMouseOut(event))
  }

  render() {
    this.element = document.createElement('div');
    this.element.classList.add('tooltip')
    document.body.append(this.element)
  }

  addEventMouseOut(event) {
    if (!event.target.dataset.tooltip) return
    this.remove()
    this.removeEventListeners()
  }

  changeCoordinates(event) {
    const shift = 5
    this.element.style.left = event.pageX + shift + 'px';
    this.element.style.top = event.pageY + shift + 'px';
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', (event) => this.addEventMouseOver(event))
    document.removeEventListener('pointerout', (event) => this.addEventMouseOut(event))
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}


const tooltip = new Tooltip();

export default tooltip;
