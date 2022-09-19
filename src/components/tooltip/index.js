class Tooltip {
  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    this.makeTooltip();

    document.addEventListener('pointerover', this.onPointerOver);
  }

  render() {
    document.body.append(this.element);
  }

  makeTooltip() {
    const div = document.createElement('div');

    div.classList.add('tooltip');

    this.element = div;
  }

  onPointerOver = event => {
    if (event.target.hasAttribute('data-tooltip')) {
      this.element.innerHTML = event.target.dataset.tooltip;

      document.addEventListener('mousemove', this.onMouseMove);

      this.render();

      document.addEventListener('pointerout', this.onPointerOut);
    }
  };

  onPointerOut = event => {
    if (!event.target.hasAttribute('data-tooltip')) {
      this.element.remove();

      document.removeEventListener('mousemove', this.onMouseMove);

      document.removeEventListener('pointerout', this.onPointerOut);
    }
  };

  onMouseMove = event => {
    const shift = 10;

    this.element.style.left = event.clientX + shift + 'px';
    this.element.style.top = event.clientY + shift + 'px';
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerout', this.onPointerOut);

    this.remove();
    this.element = null;
  }
}

export default new Tooltip();
