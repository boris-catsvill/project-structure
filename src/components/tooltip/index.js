class Tooltip {
  static instance;
  element;
  tooltipOffset = [10, 10];

  addTooltipHandler = event => {
    const tooltipValue = event.target.dataset.tooltip;
    if (tooltipValue === undefined) return;

    this.render(tooltipValue);
    this.put(event.clientX, event.clientY);
    document.addEventListener('pointermove', this.moveTooltipHandler);
  };

  moveTooltipHandler = event => {
    this.put(event.clientX, event.clientY);
  };

  removeTooltipHandler = () => {
    if (!this.element) return;
    this.element.remove();
    document.removeEventListener('pointermove', this.moveTooltipHandler);
  };

  constructor() {
    if (!Tooltip.instance) Tooltip.instance = this;
    return Tooltip.instance;
  }

  initialize() {
    document.addEventListener('pointerover', this.addTooltipHandler);
    document.addEventListener('pointerout', this.removeTooltipHandler);
  }

  render(value = '') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${value}</div>`;
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }

  destroy() {
    document.removeEventListener('pointerover', this.addTooltipHandler);
    document.removeEventListener('pointerout', this.removeTooltipHandler);
    document.removeEventListener('pointermove', this.moveTooltipHandler);
    this.element = null;
  }

  put(x, y) {
    const [offsetX, offsetY] = this.tooltipOffset;
    this.element.style.left = x + offsetX + 'px';
    this.element.style.top = y + offsetY + 'px';
  }
}

const tooltip = new Tooltip();

export default tooltip;
