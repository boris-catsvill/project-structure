class Tooltip {
  static _instance;

  message = null;

  onPointerOver = event => {
    this.message = event.target.getAttribute('data-tooltip');

    if (this.message) {
      this.render();
      event.target.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerMove = event => {
    this.setCoordinates(event.clientX, event.clientY);
  }

  onPointerOut = () => {
    this.remove();
    document.body.removeEventListener('pointermove', this.onPointerMove);
  }

  constructor() {
    if (Tooltip._instance) {
      return Tooltip._instance;
    }

    Tooltip._instance = this;
  }

  setCoordinates(x, y) {
    const offset = 7;

    this.element.style.left = `${x + offset}px`;
    this.element.style.top = `${y + offset}px`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${this.message}</div>`;

    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }

  initialize() {
    this.initEventListeners();
  }

  initEventListeners() {
    document.body.addEventListener('pointerover', this.onPointerOver);
    document.body.addEventListener('pointerout', this.onPointerOut);
  }

  removeEventListeners() {
    document.body.removeEventListener('pointerover', this.onPointerOver);
    document.body.removeEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}

const tooltip = new Tooltip();

export default tooltip;
