class Tooltip {
  static instance;

  visible = false;
  tooltipText = '';

  onPointerMove = event => {
    this.positionate(event.clientX, event.clientY);
  };

  onPointerOver = event => {
    if (event.target.dataset.tooltip != undefined) {
      this.show(event);
      event.target.addEventListener('pointermove', this.onPointerMove.bind(this));
    }
  };

  onPointerOut = event => {
    if (event.target.dataset.tooltip !== undefined) {
      event.target.removeEventListener('pointermove', this.onPointerMove.bind(this));
      this.hide();
    }
  };

  constructor() {
    this.initEventListner();
  }

  getTemplate() {
    return `
          <div class="tooltip">${this.tooltipText}</div>
      `;
  }

  render(tooltipX, tooltipY) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.element.hidden = this.visible;

    this.positionate(tooltipX, tooltipY);

    document.body.appendChild(this.element);
  }

  positionate(positionX, positionY) {
    const shift = 10;

    this.element.style.left = positionX + shift + 'px';
    this.element.style.top = positionY + shift + 'px';
  }

  show(event) {
    const tooltip = document.querySelector('.tooltip');

    if (tooltip) {
      this.visible = true;
      return;
    }

    this.visible = false;
    this.tooltipText = event.target.dataset.tooltip;
    this.render(event.clientX, event.clientY);
  }

  initialize() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;

    return Tooltip.instance;
  }

  hide(event) {
    let tooltip = document.querySelector('.tooltip');

    if (!tooltip) {
      this.visible = false;
      return this;
    }

    this.visible = false;

    tooltip.remove();
  }

  initEventListner() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  destroy() {
    this.element.remove();

    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
  }
}

const tooltip = new Tooltip();

export default tooltip;
