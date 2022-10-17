class Tooltip {
  static activeTooltip;
  element;

  showTooltipPointeroverHandle = e => {
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    this.render(e.target.dataset?.tooltip);

    document.addEventListener('pointermove', this.elementPointermoveHandle);
  };

  elementPointermoveHandle = e => {
    this.element.style.top = e.clientY + 20 + 'px';
    this.element.style.left = e.clientX + 'px';
  };

  hideTooltipPointeroutHandle = e => {
    this.remove();

    document.removeEventListener('pointermove', this.elementPointermoveHandle);
  };

  constructor() {
    if (!Tooltip.activeTooltip) {
      Tooltip.activeTooltip = this;
    } else {
      return Tooltip.activeTooltip;
    }
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
