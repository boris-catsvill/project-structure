class Tooltip {
  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    this.makeTooltip();

    document.addEventListener('pointerover', this.pointerOverFunc);
  }

  render() {
    document.body.append(this.element);
  }

  makeTooltip() {
    const div = document.createElement('div');

    div.classList.add('tooltip');

    this.element = div;
  }

  pointerOverFunc = event => {
    if (event.target.hasAttribute('data-tooltip')) {
      this.element.innerHTML = event.target.dataset.tooltip;

      document.addEventListener('mousemove', this.mouseMoveFunc);

      this.render();

      document.addEventListener('pointerout', this.pointerOutFunc);
    }
  };

  pointerOutFunc = event => {
    if (!event.target.hasAttribute('data-tooltip')) {
      this.element.remove();

      document.removeEventListener('mousemove', this.mouseMoveFunc);

      document.removeEventListener('pointerout', this.pointerOutFunc);
    }
  };

  mouseMoveFunc = event => {
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
    document.removeEventListener('pointerover', this.pointerOverFunc);
    document.removeEventListener('mousemove', this.mouseMoveFunc);
    document.removeEventListener('pointerout', this.pointerOutFunc);

    this.remove();
    this.element = null;
  }
}

export default new Tooltip();
