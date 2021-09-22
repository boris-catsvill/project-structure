class Tooltip {
  static #tooltipInstance = null;
  element = null;
  elementMoveEventListener = null;
  SHIFT = 10;

  constructor() {
    if (!Tooltip.#tooltipInstance) {
      Tooltip.#tooltipInstance = this;
    } else {
      return Tooltip.#tooltipInstance;
    }
  }

  initialize() {
    this.pointermoveHandler = this._pointermoveHandler.bind(this);
    this.pointeroverHandler = this._pointeroverHandler.bind(this);
    this.pointeroutHandler = this._pointeroutHandler.bind(this);
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.pointeroverHandler);
    document.addEventListener('pointerout', this.pointeroutHandler);
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    document.body.append(this.element);
  }

  _pointeroverHandler(event) {
    const target = event.target.closest('[data-tooltip]');

    if (!target) return;

    this.render();
    this.element.innerHTML = target.dataset.tooltip;
    this._moveTo(event.clientX, event.clientY);
    this.elementMoveEventListener = target;

    target.addEventListener('pointermove', this.pointermoveHandler);
  }

  _pointeroutHandler(event) {
    const target = event.target.closest('[data-tooltip]');

    if (!target) return;

    this.remove();
    this.elementMoveEventListener = null;
    target.removeEventListener('pointermove', this.pointermoveHandler);
  }

  _pointermoveHandler(event) {
    this._moveTo(event.clientX, event.clientY);
  }

  _moveTo(pageX, pageY) {
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
    if (this.elementMoveEventListener) {
      this.elementMoveEventListener.removeEventListener('pointermove', this.pointermoveHandler);
    }
    document.removeEventListener('pointerover', this.pointeroverHandler);
    document.removeEventListener('pointerout', this.pointeroutHandler);
  }
}

const tooltip = new Tooltip();

export default tooltip;
