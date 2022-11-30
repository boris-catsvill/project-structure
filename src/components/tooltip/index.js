class Tooltip {
  static instance;

  onMouseOver = event => {
    //проверить что здесь есть тултип
    const element = event.target.closest('[data-tooltip]');
    if (!element) return;

    this.render(element.dataset.tooltip);

    document.addEventListener('pointermove', this.onMouseMove);
    document.addEventListener('pointerout', this.onMouseOut);
  };

  onMouseMove = event => {
    this.element.style.left = this.offsetX + event.pageX - this.element.offsetWidth / 2 + 'px';
    this.element.style.top = this.offsetY + event.pageY - this.element.offsetHeight / 2 + 'px';
  }

  onMouseOut = event => {
    document.removeEventListener('pointermove', this.onMouseMove);
    document.removeEventListener('pointerout', this.onMouseOut);
    this.remove();
  }

  constructor() {
    if (Tooltip.instance) return Tooltip.instance;
    Tooltip.instance = this;

    this.offsetX = 30;
    this.offsetY = 30;
  }

  initialize() {
    document.addEventListener('pointerover', this.onMouseOver.bind(this));
  }

  render(text) {
    this.element = document.createElement('div');

    this.element.className = 'tooltip';
    this.element.innerHTML = text;
    this.element.style.position = 'absolute';
    this.element.style.zIndex = 1000;

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
    document.removeEventListener('pointerover', this.onMouseOver);
    document.removeEventListener('pointeromove', this.onMouseMove);
    document.removeEventListener('pointerout', this.onMouseOut);
  }
}

export default Tooltip;
