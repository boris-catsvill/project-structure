class Tooltip {
  element;
  static instance;
  tooltipsTargets = [];

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    } else {
      return Tooltip.instance;
    }
    this.render();
  }

  getTooltip = (event) => `
      <div class="tooltip" style="left: ${event.clientX}px; top: ${event.clientY}px">
        ${event.target.dataset.tooltip}
      </div>`;

  showTooltip = (event) => {
    this.element.innerHTML = this.getTooltip(event);
    document.body.append(this.element);
  };

  hideTooltip = () => {
    this.remove();
  };

  initEventListeners = (elem) => {
    elem.addEventListener('pointerover', this.showTooltip);
    elem.addEventListener('pointerout', this.hideTooltip);
  };

  initialize = () => {
    document.body.querySelectorAll('[data-tooltip]').forEach(elem => {
      this.initEventListeners(elem);
      this.tooltipsTargets.push(elem);
    });
  };

  render() {
    const element = document.createElement('div');
    element.innerHTML = `<div></div>`;
    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.tooltipsTargets.forEach(target => {
      target.removeEventListener('pointerover', this.showTooltip);
      target.removeEventListener('pointerout', this.hideTooltip);
    });
  }
}

const tooltip = new Tooltip();

export default tooltip;
