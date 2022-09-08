class Tooltip {
  static tooltip = null;

  constructor() {
    if (Tooltip.tooltip) {
      return Tooltip.tooltip;
    }
    Tooltip.tooltip = this;
  }

  initialize () {
    document.body.addEventListener('pointerout', this.pointerOut);
    document.body.addEventListener('pointerover', this.pointerOver);
  }

  render(tooltipValue) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${this.tooltipText}</div>`;
    this.element = wrapper.firstElementChild;
    if (this.element) this.element.textContent = `${tooltipValue ?? this.tooltip}`;
    document.body.append(this.element);
  }

  pointerOver = (event) => {
    const tooltipValue = event.target.dataset.tooltip;
    if (tooltipValue) {
      this.render(tooltipValue);
      this.initialize();
      this.pointerMouse(event);
    }
  }

  pointerMouse = (event) => {
    const indent = 10;
    this.element.style.left = `${Math.round(event.clientX + indent)}px`;
    this.element.style.top = `${Math.round(event.clientY + indent)}px`;
  }

  pointerOut = () => {
    if (this.element) this.remove();
  }

  remove() {
    if (this.element)
      this.element.remove();
  }

  destroy() {
    document.body.removeEventListener('pointerout', this.pointerOut);
    document.body.removeEventListener('pointerover', this.pointerOver);
    this.remove();
  }

}

export default Tooltip;