class Tooltip {
  static instance;
  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize () {
    this.initEventListeners();
  }
  initEventListeners() {
    document.addEventListener("pointerover", this.makePointerOver);
    document.addEventListener("pointerout", this.makePointerOut);
  }
  render(html) {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    this.element.innerHTML = html;

    document.body.append(this.element);
  }

  makePointerOver = (event) => {
    const element = event.target.closest("[data-tooltip]");
    if(element) {
      this.render(element.dataset.tooltip);
      document.addEventListener("pointermove", this.onPointerMove);
    }
  }
  makePointerOut = () => {
    this.removeElem();
    document.removeEventListener("pointermove", this.onPointerMove);
  }
  onPointerMove = (event) => {
    const shift = 10;
    const left = event.clientX + shift;
    const top = event.clientY + shift;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }
  removeElem() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.removeElem();
    this.element = null;
    document.removeEventListener('pointerover', this.makePointerOver);
    document.removeEventListener('pointerout', this.makePointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);

  }
}

export default Tooltip;

