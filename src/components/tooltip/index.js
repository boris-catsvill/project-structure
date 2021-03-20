class Tooltip {
  static instance;

  element;

  onPointerOver = event => {
    const { tooltip } = event.target.dataset;
    if (tooltip) {
      this.render(tooltip);
      event.target.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerOut = event => {
    this.remove();
    event.target.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerMove = event => {
    if (this.element) {
      this.element.style.left = event.clientX + 10 + 'px';
      this.element.style.top = event.clientY + 10 + 'px';
    }
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    this.initEventListners();
  }

  render(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${html}</div>`;
    this.element = wrapper.firstElementChild;

    document.body.append(this.element);
  }

  initEventListners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    this.element?.remove();
    this.element = null;
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    this.remove();
  }
}

const tooltip = new Tooltip();

export default tooltip;
