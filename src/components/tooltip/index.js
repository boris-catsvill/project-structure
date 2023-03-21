class Tooltip {
  constructor() {
    if (Tooltip.instance) return Tooltip.instance;
    Tooltip.instance = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerOver);
  }

  pointerOver = event => {
    const currentElem = event.target.closest('[data-tooltip]');
    if (!currentElem) return;
    this.render(currentElem.dataset.tooltip);

    document.addEventListener('pointermove', this.pointerMove);
    document.addEventListener('pointerout', this.pointerOut);
  };

  pointerOut = event => {
    document.removeEventListener('pointermove', this.pointerMove);
    document.removeEventListener('pointerout', this.pointerOut);
    this.remove();
  };

  pointerMove = event => {
    const offset = 5;
    this.element.style.left = `${event.clientX + offset}px`;
    this.element.style.top = `${event.clientY + offset}px`;
  };

  render(text) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = text;
    document.body.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerout', this.pointerOut);
    document.removeEventListener('pointermove', this.pointerMove);
  }
}

export default Tooltip;
