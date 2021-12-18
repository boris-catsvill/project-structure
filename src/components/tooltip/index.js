class Tooltip {
  static singleton;

  constructor() {
    if (Tooltip.singleton) {
      return Tooltip.singleton
    }
    else {
      Tooltip.singleton = this;
    }
  }

  initialize() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.element = document.createElement('div');
    document.body.append(this.element);
  }

  getCoordinates(event) {
    const { clientHeight } = document.documentElement;
    const tooltipPixelsShift = 10;
    this.y = event.clientY + tooltipPixelsShift;
    this.x = event.clientX + tooltipPixelsShift;
    if (event.clientY + this.toolTip.offsetHeight + tooltipPixelsShift >= clientHeight) {
      this.toolTip.style.top = this.y - this.toolTip.offsetHeight + 'px';
    } else {
      this.toolTip.style.top = this.y + 'px';
    }
    this.toolTip.style.left = this.x + 'px';
  }

  tooltipOnOver = (event) => {
    if (event.target.dataset.tooltip === undefined) return;
    this.render();
    this.toolTip = document.createElement('div');
    this.toolTip.innerHTML = event.target.dataset.tooltip;
    this.toolTip.className = 'tooltip';
    this.getCoordinates(event);
    this.element.append(this.toolTip);
    event.target.addEventListener('pointermove', this.tooltipOnMove)
  }

  removeTooltip = (event) => {
    if (event.target.dataset.tooltip === undefined) return;
    this.remove();
  }

  tooltipOnMove = (event) => {
    this.getCoordinates(event);
}

  attachEventListeners() {
    document.addEventListener('pointerover', this.tooltipOnOver);
    document.addEventListener('pointerout', this.removeTooltip);
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', this.tooltipOnOver);
    document.removeEventListener('pointerout', this.removeTooltip);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}

export default Tooltip;
