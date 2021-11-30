class Tooltip {
  element;

  tooltipText = '';

  constructor() {
    if (Tooltip._instance) {
      return Tooltip._instance;
    }
    Tooltip._instance = this;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = `<div class="tooltip">${this.tooltipText}</div>`;
    this.element = element.firstElementChild;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  onPointerMove = (e) => {
    this.element.style.top = `${(e.clientY + 10).toString()}px`;
    this.element.style.left = `${(e.clientX + 10).toString()}px`;
  }

  onPointerOver = (e) => {
    const element = e.target.closest('[data-tooltip]');
    if (element) {
      this.render(element.dataset.tooltip);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerOut = () => {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  initialize() {
    document.body.append(this.element);
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerover', this.onPointerOver);
  }
}

export default Tooltip;
