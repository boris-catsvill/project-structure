class Tooltip {
  static instance;

  onPointerOver = (event) => {
    const tooltipElem = event.target.closest('[data-tooltip]');
    if (!tooltipElem) return;
    const tooltipValue = tooltipElem.dataset.tooltip;
    this.render(tooltipValue);
    tooltipElem.addEventListener('pointermove', this.onPointerMove);
  }

  onPointerOut = (event) => {
    const tooltipElem = event.target.closest('[data-tooltip]');
    if (!tooltipElem) return;
    this.remove();
    tooltipElem.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerMove = (event) => {
    const offset = 10;
    this.element.style.top = `${event.y + offset}px`;
    this.element.style.left = `${event.x + offset}px`;
  }

  constructor () {
    if (Tooltip.instance) return Tooltip.instance;
    Tooltip.instance = this;
  }

  getTemplate(message) {
    return `<div class="tooltip">${message}</div>`;
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }

  initialize() {
    this.addEventListeners();
  }

  render(message = '') {
    this.element = this.toHTML(this.getTemplate(message));
    document.body.append(this.element);
  }

  addEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}

export default Tooltip;
