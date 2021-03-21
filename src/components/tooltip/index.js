class Tooltip {
  static instance;

  constructor() {
      if (Tooltip.instance) {
          return Tooltip.instance;
      }

      Tooltip.instance = this;
  }

  handleMouseOver = event => {
      const parent = event.target.closest('[data-tooltip]');

      if (parent) {
          this.render(parent.dataset.tooltip);
          document.addEventListener('pointermove', this.setPositionTooltip);
      }        
  }

  handleMouseOut = () => {
      if (this.element) {
          this.remove();
      }
  }

  setPositionTooltip = event => {
      const shift = 10;
      this.element.style.left = `${event.clientX + shift}px`;
      this.element.style.top = `${event.clientY + shift}px`;
  }

  initialize = () => {
      document.addEventListener("pointerover", this.handleMouseOver);
      document.addEventListener("pointerout", this.handleMouseOut);
  }

  render(text) {
      const element = document.createElement('div');

      element.innerHTML = `<div class="tooltip">${text}</div>`;

      this.element = element.firstElementChild;
      document.body.append(this.element);
  }

  remove() {
      if (this.element) {
          this.element.remove();
          this.element = null;

          document.removeEventListener('pointemove', this.setPositionTooltip);
      }
  }
  
  destroy() {
      this.remove();
      document.removeEventListener("pointerover", this.handleMouseOver);
      document.removeEventListener("pointerout", this.handleMouseOut);
  }
}

const tooltip = new Tooltip();

export default tooltip;
