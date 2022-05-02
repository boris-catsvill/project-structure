class Tooltip {
  static #onlyInstance = null;

  pointerMove = event => {
    if (!this.tooltipContent) {
      return;
    }
    this.element.style.left = (event.clientX + 10) + 'px';
    this.element.style.top = (event.clientY + 10) + 'px';
  }

  pointerOver = event => {
    this.tooltipContent = event.target.dataset.tooltip;

    if (!this.tooltipContent) {
      return;
    }

    event.target.addEventListener('pointermove', this.pointerMove);

    this.render(this.tooltipContent);
  }

  pointerOut = event => {
    if (!this.tooltipContent) {
      return;
    }
    event.target.removeEventListener('pointermove', this.pointerMove);
    this.element.remove();
  }

  constructor() {
    if (!Tooltip.#onlyInstance) {
      let toolTip = document.createElement('div');
      toolTip.className = `tooltip`;

      this.element = toolTip;

      Tooltip.#onlyInstance = this;
    } else {
      return Tooltip.#onlyInstance;
    }
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  render(content) {
    this.element.innerHTML = content;
    document.body.append(this.element);
  }

  destroy() {
    this.element.remove();
    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerout', this.pointerOut);
    document.removeEventListener('pointerout', this.pointerMove);
    Tooltip.#onlyInstance = null;
  }
}

const tooltip = new Tooltip();

export default tooltip;
