class Tooltip {
  static tooltipInstance = null;
  element = null;
  SHIFT = 10;

  pointeroverHandler = event => {
    const target = event.target.closest('[data-tooltip]');

    if (!target) return;

    this.remove();
    this.render();
    this.element.innerHTML = target.dataset.tooltip;
    this.moveTo(event.clientX, event.clientY);
  }

  pointeroutHandler = event => {
    const target = event.target.closest('[data-tooltip]');

    if (!target) return;

    this.remove();
  }

  pointermoveHandler = event => {
    const target = event.target.closest('[data-tooltip]');

    if (!target) {
      this.remove();
      return;
    }

    this.moveTo(event.clientX, event.clientY);
  }

  constructor() {
    if (!Tooltip.tooltipInstance) {
      Tooltip.tooltipInstance = this;
    }

    return Tooltip.tooltipInstance;
  }

  initialize() {
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.pointeroverHandler);
    document.addEventListener('pointerout', this.pointeroutHandler);
    document.addEventListener('pointermove', this.pointermoveHandler);
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    document.body.append(this.element);
  }

  moveTo(pageX, pageY) {
    const elementWidth = this.element.offsetWidth;
    const elementHeight = this.element.offsetHeight;

    const documentWidth = document.documentElement.clientWidth;
    const documentHeight = document.documentElement.clientHeight;

    const left = documentWidth - pageX - this.SHIFT - elementWidth;
    const top = documentHeight - pageY - this.SHIFT - elementHeight;

    this.element.style.left = (left > 0 ? pageX + this.SHIFT : documentWidth - elementWidth) + 'px';
    this.element.style.top = (top > 0 ? pageY + this.SHIFT : documentHeight - elementHeight) + 'px';
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.pointeroverHandler);
    document.removeEventListener('pointerout', this.pointeroutHandler);
    document.removeEventListener('pointermove', this.pointermoveHandler);
  }
}

const tooltip = new Tooltip();

export default tooltip;
