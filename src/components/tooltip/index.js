class Tooltip {
  static instance = new Tooltip();
  static haveTooltip = (el) => el.matches('[data-tooltip]');

  addedToPage = false;

  /**
   * @param {MouseEvent} event
   */
  moveHandler = (event) => {
    const offset = 5;
    this.tooltipX = event.pageX + offset;
    this.tooltipY = event.pageY + offset;
    this.render();
  };

  /**
   * @param {MouseEvent} event
   */
  hoverHandler = (event) => {
    if (Tooltip.haveTooltip(event.target)) {
      this.tooltipText = event.target.dataset.tooltip;
      this.render();

      event.target.addEventListener('pointermove', this.moveHandler, { passive: true });
    }
  };

  /**
   * @param {MouseEvent} event
   */
  leaveHandler = (event) => {
    if (Tooltip.haveTooltip(event.target)) {
      event.target.removeEventListener('pointermove', this.moveHandler);
      this.remove();
    }
  };

  /**
   * @return {Tooltip}
   */
  constructor() {
    // TODO: Создание singleton через new вводит в заблуждение
    return Tooltip.instance || this;
  }

  initialize() {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.style.position = 'absolute';

    document.body.addEventListener('pointerover', this.hoverHandler, { passive: true });
    document.body.addEventListener('pointerout', this.leaveHandler);
  }

  render() {
    if (!this.addedToPage) {
      document.body.append(this.element);
      this.addedToPage = true;
    }

    this.element.textContent = this.tooltipText;
    this.element.style.left = this.tooltipX + 'px';
    this.element.style.top = this.tooltipY + 'px';
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.addedToPage = false;
    }
  }

  destroy() {
    if (this.element) {
      this.remove();
      this.element = null;
      document.body.removeEventListener('pointerover', this.hoverHandler);
      document.body.removeEventListener('pointerout', this.leaveHandler);
    }
  }
}

export default Tooltip;
