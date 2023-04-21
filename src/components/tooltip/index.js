class Tooltip {
  static instance;
  element;
  tooltipOffset = [10, 10];
  controller = new AbortController();

  addTooltipHandler = event => {
    const tooltipValue = event.target.dataset.tooltip;
    if (tooltipValue === undefined) return;

    this.render(tooltipValue);
    this.put(event.clientX, event.clientY);
    document.addEventListener('pointermove', this.moveTooltipHandler, {
      signal: this.controller.signal
    });
  };

  moveTooltipHandler = event => {
    this.put(event.clientX, event.clientY);
  };

  removeTooltipHandler = () => {
    if (!this.element) return;
    this.element.remove();
    // Здесь надо удалить только один обработчик, поэтому использую removeEventListener,
    // а не AbortController. По идее можно не указывать в аргументах signal
    // но в доке https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#matching_event_listeners_for_removal
    // написано следующее:
    // It's worth noting that some browser releases have been inconsistent on this,
    // and unless you have specific reasons otherwise, it's probably wise to use
    // the same values used for the call to addEventListener() when calling removeEventListener().
    document.removeEventListener('pointermove', this.moveTooltipHandler, {
      signal: this.controller.signal
    });
  };

  constructor() {
    if (!Tooltip.instance) Tooltip.instance = this;
    return Tooltip.instance;
  }

  initialize() {
    document.addEventListener('pointerover', this.addTooltipHandler, {
      signal: this.controller.signal
    });
    document.addEventListener('pointerout', this.removeTooltipHandler, {
      signal: this.controller.signal
    });
  }

  render(value = '') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${value}</div>`;
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }

  destroy() {
    this.controller.abort();
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
