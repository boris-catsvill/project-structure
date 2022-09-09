class Tooltip {
  static instance;
  static shift = 10;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  pointerOver = (event) => {
    const tooltipElement = event.target.closest("[data-tooltip]");
    if (tooltipElement) {
      document.addEventListener('pointermove', this.pointerMove);
      this.tooltipText = tooltipElement.dataset.tooltip;
      this.render(event.clientX, event.clientY);
    }
  };

  pointerMove = (event) => {
    this.element.style.left = `${event.clientX + Tooltip.shift}px`;
    this.element.style.top = `${event.clientY + Tooltip.shift}px`;
  };

  pointerOut = () => {
    this.remove();
  };

  render(x = 0, y = 0) {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    this.element.textContent = this.tooltipText;
    this.element.style.position = "absolute";
    this.element.style.left = `${x + Tooltip.shift}px`;
    this.element.style.top = `${y + Tooltip.shift}px`;
    document.body.append(this.element);
  }

  remove() {
    document.removeEventListener('pointermove', this.pointerMove);
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointermove', this.pointerMove);
    document.removeEventListener('pointerout', this.pointerOut);
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

export default Tooltip;
