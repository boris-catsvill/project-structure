class Tooltip {
  static #instance;
  offset = 15;

  constructor() {
    if(Tooltip.#instance) return Tooltip.#instance;
    Tooltip.#instance = this;
  }

  onTooltipPointerOver = (event) => {
    const elem = event.target.closest('[data-tooltip]');
    if(!elem) return;

    const tooltip = elem.dataset.tooltip;
    this.render(tooltip);
    document.addEventListener('pointermove', this.onTooltipPointerMove);
  }

  onTooltipPointerMove = (event) => {
    this.element.style.left = `${event.clientX + this.offset}px`;
    this.element.style.top = `${event.clientY + this.offset}px`;  
  }

  onTooltipPointerOut = (event) => {
    const elem = event.target.closest('[data-tooltip]');
    if(!elem) return;

    if(Tooltip.#instance) {
      document.removeEventListener('pointermove', this.onTooltipPointerMove);
      this.remove();
    }
  }

  initialize() {
    document.addEventListener('pointerover', this.onTooltipPointerOver);
    document.addEventListener('pointerout', this.onTooltipPointerOut);
  }

  getTemplate(text) {
    return `<div class="tooltip">${text}</div>`
  }

  render(text) {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate(text);
    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointermove', this.onTooltipPointerMove);
    document.removeEventListener('pointerover', this.onTooltipPointerOver);
    document.removeEventListener('pointerout', this.onTooltipPointerOut);
    this.remove();
    Tooltip.#instance = null;
    this.element = null;
  } 
}

const tooltip = new Tooltip();

export default tooltip;