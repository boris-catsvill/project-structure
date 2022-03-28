class Tooltip {
  static instace;
  element = {};

  constructor() {
    if (Tooltip.instace) {
      return Tooltip.instace;
    }
    Tooltip.instace = this;
  }

  render = title => {
    const $wrapper = document.createElement('div');
    $wrapper.insertAdjacentHTML('beforeend', `<div class="tooltip">${title}</div>`);
    this.element = $wrapper.firstElementChild;

    document.body.append(this.element);
  };

  pointerOverHandler = event => {
    if (event.target.dataset.tooltip) {
      this.render(event.target.dataset.tooltip);
      this.element.style.top = (event.pageY + 15) + 'px';
      this.element.style.left = (event.PageX + 15) + 'px';
      document.removeEventListener('pointerout', this.pointerOutHandler);
    }
  };

  pointerMoveHandler = event => {
    const target = event.target.dataset.tooltip;
    if (target) {
      this.element.style.top = (event.pageY + 15) + 'px';
      this.element.style.left = (event.pageX + 15) + 'px';
      this.dispatchEvent('tooltip-move', event.target);
    }
  };

  pointerOutHandler = event => {
    const target = event.target.dataset.tooltip;
    if (target) {
      this.element.remove();
      document.removeEventListener('pointerover', this.pointerOverHandler);
      document.removeEventListener('pointermove', this.pointerMoveHandler);
      this.dispatchEvent('tooltip-out', event.target);
    }
  };

  initialize = () => {
    document.body.addEventListener('pointerover', this.pointerOverHandler);
    document.body.addEventListener('pointermove', this.pointerMoveHandler);
    document.body.addEventListener('pointerout', this.pointerOutHandler);
  };

  destroy = () => {
    this.remove();
    this.element = null;
    document.removeEventListener('pointerover', this.pointerOverHandler);
    document.removeEventListener('pointerout', this.pointerOutHandler);
    document.removeEventListener('pointermove', this.pointerMoveHandler);
  };

  dispatchEvent = (type, target) => {
    document.dispatchEvent(new CustomEvent(type, {
      detail: target,
    }));
  };

  remove = () => {
    this.element.remove();
  };
}

export default new Tooltip();
