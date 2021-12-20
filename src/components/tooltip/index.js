class Tooltip {
  static instance;

  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize () {
    document.addEventListener('pointerover', this.onMouseOver);
  }

  onMouseOver = event => {
    if (event.target.dataset.tooltip !== undefined) {
      this.showTooltip(event);
    }
  };

  showTooltip(event) {
    this.render(event.target.dataset.tooltip);

    event.target.addEventListener('pointermove', this.moveTooltip);
    event.target.addEventListener('pointerout', this.hideTooltip);
  }

  hideTooltip(event) {
    event.target.removeEventListener('pointermove', this.moveTooltip);
    event.target.removeEventListener('pointerout', this.hideTooltip);

    if (Tooltip.instance) {
      Tooltip.instance.remove();
    }
  }

  moveTooltip(event) {
    const offset = 5;

    Tooltip.instance.element.style.top = `${event.clientY + offset}px`;
    Tooltip.instance.element.style.left = `${event.clientX + offset}px`;
  }

  render(text) {
    const element = document.createElement('div');
    element.innerHTML = `<div class="tooltip">${text}</div>`;

    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    Tooltip.instance = null;
  }
}

const tooltip = new Tooltip();

export default tooltip;
