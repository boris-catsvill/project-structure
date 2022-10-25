class Tooltip {
  static activeTooltip;
  element;
  offsetHTMLElement = 20;

  showTooltipPointeroverHandle = event => {
    const target = event.target.closest('[data-tooltip]');
    if (!target) return;
    this.render(event.target.dataset?.tooltip);

    document.addEventListener('pointermove', this.elementPointermoveHandle);
  };

  elementPointermoveHandle = event => {
    this.element.style.top = event.clientY + this.offsetHTMLElement + 'px';
    this.element.style.left = event.clientX + 'px';
  };

  hideTooltipPointeroutHandle = event => {
    this.remove();

    document.removeEventListener('pointermove', this.elementPointermoveHandle);
  };

  constructor() {
    if (!Tooltip.activeTooltip) {
      Tooltip.activeTooltip = this;
    }

    return Tooltip.activeTooltip;
  }

  initEventListners() {
    document.addEventListener('pointerover', this.showTooltipPointeroverHandle);
    document.addEventListener('pointerout', this.hideTooltipPointeroutHandle);
  }

  initialize() {
    this.initEventListners();
  }

  render(textLabel) {
    this.element = document.createElement('div');
    this.element.classList = 'tooltip';
    this.element.innerHTML = textLabel;
    document.body.append(this.element);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    document.removeEventListener('pointerover', this.showTooltipPointeroverHandle);
    document.removeEventListener('pointerout', this.hideTooltipPointeroutHandle);

    this.remove();
    this.element = null;
    Tooltip.activeTooltip = null;
  }
}

/* FIXME: Работает все правильно. Зачем так export??? */
const tooltip = new Tooltip();

export default tooltip;
