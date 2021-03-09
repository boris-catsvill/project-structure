class Tooltip {
  static instance;
  element;

  onMouseOver = (evt) => {
    const element = evt.target.closest('[data-tooltip]');

    if (element) {
      this.render(element.dataset.tooltip);
      this.shiftTooltip(evt);

      document.addEventListener('pointermove', this.onMouseMove);
    }
  }

  onMouseMove = event => {
    this.shiftTooltip(event);
  };

  onMouseOut = () => {
    this.removeTooltip();
  };

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onMouseOver);
    document.addEventListener('pointerout', this.onMouseOut);
  }

  shiftTooltip(evt) {
    const shift = 10;
    const posX = evt.clientX + shift;
    const posY = evt.clientY + shift;

    this.element.style.left = `${posX}px`;
    this.element.style.top = `${posY}px`;
  }

  getTooltipTemplate(data) {
    return `<div class="tooltip">${data}</div>`;
  }

  render(data) {
    const elementWrapper = document.createElement('div');

    elementWrapper.innerHTML = this.getTooltipTemplate(data);

    this.element = elementWrapper.firstElementChild;
    document.body.append(this.element);
  }

  initialize() {
    this.initEventListeners();
  }


  removeTooltip() {
    if (this.element) {
      this.element.remove();
      this.element = null;

      document.removeEventListener('pointermove', this.onMouseMove);
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeTooltip();
    document.removeEventListener('pointermove', this.onMouseOver);
    document.removeEventListener('pointerout', this.onMouseOut);
  }
}

const tooltip = new Tooltip();

export default tooltip;
