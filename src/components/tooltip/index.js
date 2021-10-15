class Tooltip {
  static instance;

  element;

  onPointerOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      this.render(element.dataset.tooltip);
      this.move(event.clientX, event.clientY);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerOut = () => {
    this.remove();
  }

  onPointerMove = event => {
    this.move(event.clientX, event.clientY);
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  render(tooltip = '') {
    this.element = document.createElement('div');
    this.element.classList.add('tooltip');
    this.element.innerHTML = tooltip;

    document.body.append(this.element);
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  initialize() {
    this.initEventListeners();
  }

  move(x, y) {
    this.element.style.left = (x + 5) + 'px';
    this.element.style.top = (y + 5) + 'px';
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;

      document.removeEventListener('pointermove', this.onPointerMove);
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);

    this.remove();
    Tooltip.instance = null;
  }
}

const tooltip = new Tooltip();

export default tooltip;
