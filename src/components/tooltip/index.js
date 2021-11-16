export default class Tooltip {
  static instance;
  element;

  onPointerOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (!element) return;

    this.render(element.dataset.tooltip);

    document.addEventListener('pointermove', this.onPointerMove);
  }

  onPointerMove = event => {
    const shift = 10;
    const top = event.clientY + shift;
    const left = event.clientX + shift;

    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
  }

  onPointerOut = () => {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  render(html = '') {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;

    document.body.append(this.element);
  }

  initialize() {
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
  }
}
