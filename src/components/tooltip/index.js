class Tooltip {
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  onPointerOver = ({ target }) => {
    const element = target.closest('[data-tooltip]');

    if (element) {
      const { tooltip } = element.dataset;
      document.addEventListener('pointermove', this.onPointerMove);
      document.addEventListener('pointerout', this.onPointerOut);
      this.render(tooltip);
    }
  };

  onPointerOut = () => {
    console.log('tooltip pointer out');
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerout', this.onPointerOut);
    this.remove();
  };

  onPointerMove = event => {
    console.log('tooltip pointer move');
    this.moveTooltip(event);
  };

  moveTooltip({ pageX, pageY }) {
    const shift = 10;
    const top = pageY + shift;
    const left = pageX + shift;
    this.element.style.top = top + 'px';
    this.element.style.left = left + 'px';
  }

  initialize() {
    document.addEventListener('pointerover', this.onPointerOver);
  }

  render(tooltip) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class='tooltip'>${tooltip}</div>`;
    this.element = wrap.firstElementChild;
    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);
  }
}

const tooltip = new Tooltip();
export default tooltip;
