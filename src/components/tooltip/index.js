class Tooltip {
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
    this.abortController = new AbortController();
  }

  initialize() {
    this.addEventListeners();
  }

  render(message) {
    const div = document.createElement("div");
    div.innerHTML = this.getTooltipHtml(message);
    this.element = div.firstElementChild;
    document.body.append(this.element);
  }

  onPointerMove = (event) => {
    this.moveTooltip(event);
  };

  moveTooltip(event) {
    const shift = 10;
    const left = event.clientX + shift;
    const top = event.clientY + shift;
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  onPointerOver = (event) => {
    const dataTooltip = event.target.closest("[data-tooltip]");
    if (!dataTooltip) {
      return;
    }
    this.render(dataTooltip.dataset.tooltip);
    document.addEventListener(
      "pointermove",
      this.onPointerMove,
      this.abortController.signal
    );
  };

  onPointerOut = (event) => {
    this.remove();
    document.removeEventListener("pointermove", this.onPointerMove);
  };

  addEventListeners() {
    document.body.addEventListener(
      "pointerover",
      this.onPointerOver,
      this.abortController.signal
    );

    document.body.addEventListener(
      "pointerout",
      this.onPointerOut,
      this.abortController.signal
    );
  }

  getTooltipHtml(message) {
    return `
      <div class="tooltip">${message}</div>
    `;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.abortController.abort();
    this.remove();
    this.element = null;
  }
}


const tooltip = new Tooltip();
export default tooltip;
