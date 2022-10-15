class Tooltip {
  static currentElement;
  element;

  constructor() {
    if (Tooltip.currentElement)
      return Tooltip.currentElement;

    Tooltip.currentElement = this;
  }

  render(innerTemplate) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = innerTemplate;

    document.body.append(this.element);
  }

  initialize() {
    document.body.addEventListener('pointerover', this.showTooltip);
    document.body.addEventListener('pointerout', this.hideTooltip);
  }

  showTooltip = (event) => {
    const tooltipElement = event.target.closest('[data-tooltip]');

    if (tooltipElement) {
      this.render(tooltipElement.dataset.tooltip);
      document.body.addEventListener('pointermove', this.moveTooltip);
    }
  }

  moveTooltip = (event) => {
    const shiftX = 5;
    const shiftY = 10;
    this.element.style.top = event.clientY + shiftY + 'px';
    this.element.style.left = event.clientX + shiftX + 'px';
  }

  hideTooltip = () => {
    document.body.removeEventListener('pointermove', this.moveTooltip);
    this.remove();
  }

  removeEventListeners() {
    document.body.removeEventListener('pointerover', this.showTooltip);
    document.body.removeEventListener('pointerout', this.hideTooltip);
    document.body.removeEventListener('pointermove', this.moveTooltip);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.removeEventListeners();
  }
}

const tooltip = new Tooltip();

export default tooltip;
