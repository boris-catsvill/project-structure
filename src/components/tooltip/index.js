class Tooltip {
  element = document.createElement('div');
  static tip = document.createElement('div');

  constructor() {
    this.tooltipAttr = '';

    if (!Tooltip._instance) {
      Tooltip._instance = this;
    }
    return Tooltip._instance;

  }


  static initialize() {
    document.addEventListener('pointerover', this.showTooltip, false);
    document.addEventListener('pointerout', this.hideTooltip, false);
    document.addEventListener('mousemove', this.mouseMoving, false);
    document.addEventListener('mouseout', this.mouseHide, false);
  }


  showTooltip(event) {
    if (event.target.dataset.tooltip === undefined) {
      return;
    }
    this.tooltipAttr = event.target.dataset.tooltip;
    this.render();
    Tooltip.tip = this.element;
  }

  render() {
    this.element .innerHTML = `<div class="tooltip">${this.tooltipAttr}</div>`;
    this.element = this.element .firstChild;
    document.body.append(this.element);
    return this.element ;
  }

  mouseMoving(event) {
    Tooltip.tip.style.transform = 'translateY(' + (event.clientY - 60) + 'px)';
    Tooltip.tip.style.transform += 'translateX(' + (event.clientX + 10) + 'px)';
  }

  mouseHide() {
    document.removeEventListener('mousemove', this.mouseMoving, false);
  }

  hideTooltip() {
    Tooltip.tip.remove();
    document.removeEventListener('pointerover', this.showTooltip, false);
  }

  remove() {
    document.removeEventListener('pointerover', this.showTooltip, false);
    document.removeEventListener('pointerout', this.hideTooltip, false);
    document.removeEventListener('mousemove', this.mouseMoving, false);
    document.removeEventListener('mouseout', this.mouseHide, false);
  }

  destroy() {
    this.remove();
    this.element.remove();
    Tooltip.tip.remove();
  }
}

export default Tooltip;
