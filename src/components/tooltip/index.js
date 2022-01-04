class Tooltip {
  static _instance;
  element;
  shift = 10;

  constructor() {
    if (Tooltip._instance) {
      return Tooltip._instance;
    }
    Tooltip._instance = this;

    this.render();
  }

  render(html = '') {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;

    document.body.append(this.element);
  }

  onPointerMove = (event) => {
    this.element.style.top = `${(event.clientY + this.shift).toString()}px`;
    this.element.style.left = `${(event.clientX + this.shift).toString()}px`;
  }

  onPointerOver = (event) => {
    const element = event.target.closest('[data-tooltip]');
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
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
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
