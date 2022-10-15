class Tooltip {
  static #onlyInstance = null;

  constructor() {
    if (!Tooltip.#onlyInstance) {
      Tooltip.#onlyInstance = this;
    } else {
      return Tooltip.#onlyInstance;
    }
  }

  tooltipPosition = event => {
    const shift = 10;
    const left = event.clientX + shift;
    const top = event.clientY + shift;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  };

  showTooltip = event => {
    const tooltipText = event.target.dataset.tooltip;
    if (tooltipText) {
      this.render(tooltipText);
      document.body.addEventListener('pointermove', this.tooltipPosition);
    }
  };

  hideTooltip = () => {
    Tooltip.#onlyInstance.element.remove();
    document.body.removeEventListener('pointermove', this.tooltipPosition);
  };

  initialize() {
    document.body.addEventListener('pointerover', this.showTooltip);
    document.body.addEventListener('pointerout', this.hideTooltip);
  }

  render(tooltipText) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = tooltipText;
    document.body.append(this.element);
  }

  remove() {
    document.body.removeEventListener('pointerover', this.showTooltip);
    document.body.removeEventListener('pointerout', this.hideTooltip);
    this.hideTooltip();
  }
  destroy() {
    this.remove();
  }
}

const tooltip = new Tooltip();

export default tooltip;
