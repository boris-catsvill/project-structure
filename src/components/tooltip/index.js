class Tooltip {
  static onlyInstance = null;
  /**
   * @return {null}
   */
  constructor() {
    if (!Tooltip.onlyInstance) {
      Tooltip.onlyInstance = this;
    } else {
      return Tooltip.onlyInstance;
    }
  }
  initialize () {
    this.initEventListeners();
  }
  initTargetOut(event) {
    const name = event.target.closest("[data-tooltip]");
    if (name) {
      document.removeEventListener("pointermove", event=>this.move(event))
      this.remove();
    }
  }
  initTargetOver(event) {
    const name = event.target.closest("[data-tooltip]");
    if (name) {
      this.render(name.dataset.tooltip);
      this.move(event);
    }
  }

  render(name) {
    this.element = document.createElement('div'); // (*)
    this.element.innerHTML = name;
    this.element.className = "tooltip";
    document.body.append(this.element);
    document.addEventListener("pointermove", event=>this.move(event));


  }
  move(event) {
    const shift = 10;
    const toolTipX = event.clientX;
    const toolTipY = event.clientY;
    this.element.style.left = toolTipX + shift + "px";
    this.element.style.top = toolTipY + shift + "px";
  }
  initEventListeners () {
    document.addEventListener("pointerover", event=>this.initTargetOver(event));
    document.addEventListener("pointerout", event=>this.initTargetOut(event));
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener("pointerover", event=>this.initTargetOver(event));
    document.removeEventListener("pointerout", event=>this.initTargetOut(event));
    document.removeEventListener("pointermove", event=>this.move(event));
  }
}

const tooltip = new Tooltip();

export default tooltip;
