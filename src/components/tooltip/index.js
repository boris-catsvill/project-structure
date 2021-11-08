class Tooltip {
  static instance = null;
  element;

  moveHandler = (event) => {
    const displace = 10;
    this.element.style.left = event.clientX + displace + "px";
    this.element.style.top = event.clientY + displace + "px";
  };

  overHandler = (event) => {
    const target = event.target.closest("[data-tooltip]");
    if (target) {
      this.render(target.dataset.tooltip);
      document.addEventListener("pointermove", this.moveHandler);
    }
  };

  outHandler = () => {
    this.remove();
    document.removeEventListener("pointermove", this.moveHandler);
  };

  constructor() {
    if (!Tooltip.instance) Tooltip.instance = this;
    return Tooltip.instance;
  }
  render(html) {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    this.element.innerHTML = html;
    document.body.append(this.element);
  }
  initialize() {
    document.addEventListener("pointerover", this.overHandler);
    document.addEventListener("pointerout", this.outHandler);
  }
  remove() {
    if (this.element) this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
    Tooltip.instance = null;
    document.removeEventListener("pointerover", this.overHandler);
    document.removeEventListener("pointerout", this.outHandler);
    document.removeEventListener("pointermove", this.moveHandler);
  }
}

export default Tooltip;
