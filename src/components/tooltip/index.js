class Tooltip {
  static tooltip;
  element;
  prevTarget;

  constructor() {
    if (!Tooltip.tooltip) {
      Tooltip.tooltip = this;
    }
    return Tooltip.tooltip;
  }

  initialize() {
    this.initEventListeners();
  }

  getTemplate(text) {
    return `
      <div class="tooltip">${text}</div>
    `;
  }

  render(text) {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate(text);

    this.element = element.firstElementChild;

    document.body.append(this.element);
  }

  initEventListeners() {
    document.body.addEventListener('pointerover', this.onPointerOver);
    document.body.addEventListener('pointerout', this.onPointerOut);
  }

  onPointerOver = (event) => {
    document.body.addEventListener('pointermove', this.onMouseMove);

    const target = event.target;
    if (!target.dataset.tooltip) {
      return;
    }
    this.render();

    this.prevTarget = target;
    this.element.innerHTML = target.dataset.tooltip;
  };

  onPointerOut = (event) => {
    const target = event.target;
    if (this.prevTarget === target) {
      this.remove();
      document.body.removeEventListener('pointermove', this.onMouseMove);
    }
  };

  onMouseMove = (event) => {
    const offset = 10;

    this.element.style.top = `${event.clientY + offset}px`;
    this.element.style.left = `${event.clientX + offset}px`;
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.body.removeEventListener('pointerover', this.onPointerOver);
    document.body.removeEventListener('pointerout', this.onPointerOut);
    document.body.removeEventListener('pointermove', this.onMouseMove);
    this.remove();
    Tooltip.tooltip = null;
    this.element = null;
    this.prevTarget = null;
  }
}

const tooltip = new Tooltip();
tooltip.initialize();

export default tooltip;
