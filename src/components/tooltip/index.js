class Tooltip {
  static instance = null;

  element
  isVisible = false;

  constructor() {
    if (!this.instance) {
      this.instance = this;
    }

    return this.instance;
  }

  render = (event, tooltip) => {
    const {pageX, pageY} = event;

    if (this.element) {
      this.element.style = `position: absolute; top: ${pageY + 15}px; left: ${pageX + 15}px;`;

      this.element.firstElementChild.innerText = tooltip;

      document.body.append(this.element);
    } else {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = `<div style="position: absolute; top: ${pageY + 15}px; left: ${pageX + 15}px;"><div class="tooltip">${tooltip}</div>`;

      const element = wrapper.firstElementChild;

      this.element = element;

      document.body.append(element);
    }
  }

  pointerOverHandle = (event) => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      const {tooltip} = element.dataset;

      this.isVisible = true;
      if (this.element) {
        this.element.hidden = false;
      }
      this.render(event, tooltip);
    }
  }

  pointerOutHandle = () => {
    this.isVisible = false;
    if (this.element) {
      this.element.hidden = true;
    }
  }

  pointerMoveHandle = (event) => {
    const element = event.target.closest('[data-tooltip]');
    
    if (this.isVisible && element) {
      const {tooltip} = element.dataset;

      this.render(event, tooltip);
    }
  }

  initialize () {
    document.addEventListener('pointerover', this.pointerOverHandle);

    document.addEventListener('pointerout', this.pointerOutHandle);

    document.addEventListener('pointermove', this.pointerMoveHandle);
  }

  remove () {
    if (this.element) {
      document.removeEventListener('pointerover', this.pointerOverHandle);

      document.removeEventListener('pointerout', this.pointerOutHandle);

      document.removeEventListener('pointermove', this.pointerMoveHandle);

      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = {};    
  }
}

const tooltip = new Tooltip();

export default tooltip;
