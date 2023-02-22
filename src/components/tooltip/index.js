class Tooltip {
  static instance = null;
  element = null;

  MOUSE_INDENT = 5; // отступ в пикселях от указателя мыши, добавляет плавность и видимость текста

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  render(text, parent = document.body) {
    this.element.textContent = text;
    parent.append(this.element);
  }

  static initialize() {
    Tooltip.element = document.createElement('div');
    Tooltip.element.className = 'tooltip';
    document.addEventListener('pointerover', Tooltip.mouseOver);
    document.addEventListener('pointerout', Tooltip.mouseOut);
  }

  move = event => {
    this.element.style.left = `${event.clientX + this.MOUSE_INDENT}px`;
    this.element.style.top = `${event.clientY + this.MOUSE_INDENT}px`;
  };

  mouseOver = event => {
    const parent = event.target;
    if (parent.dataset.tooltip) {
      this.render(parent.dataset.tooltip, parent);
      document.addEventListener('mousemove', this.move);
    }
  };
  mouseOut = () => {
    document.removeEventListener('mousemove', this.move);
    this.remove();
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.mouseOver);
    document.removeEventListener('pointerout', this.mouseOut);
    document.removeEventListener('mousemove', this.move);
    this.element = null;
  }
}

export default Tooltip;
