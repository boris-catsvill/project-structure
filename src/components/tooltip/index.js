class Tooltip {
  offset = {
    x: 5,
    y: 5
  };

  static instance = null;

  handlePointerOver = event => {
    const textWithTooltip = event.target.closest('[data-tooltip]');

    if (!textWithTooltip) return;

    this.render(textWithTooltip.dataset.tooltip);

    document.addEventListener('pointermove', this.handlePointerMove);
  };

  handlePointerMove = event => {
    this.element.style.left = event.clientX + this.offset.x + 'px';
    this.element.style.top = event.clientY + this.offset.y + 'px';
  };

  handlePointerOut = () => {
    document.removeEventListener('pointerout', this.handlePointerMove);
    this.remove();
  };

  constructor() {
    if (Tooltip.instance) return Tooltip.instance;

    Tooltip.instance = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.handlePointerOver);
    document.addEventListener('pointerout', this.handlePointerOut);
  }

  render(text = '') {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<div class="tooltip">${text}</div>`;
    this.element = wrapper.firstElementChild;

    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    Tooltip.instance = null;
    document.removeEventListener('pointerover', this.handlePointerOver);
    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerout', this.handlePointerOut);
  }
}

export default new Tooltip();
