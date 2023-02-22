class Tooltip {
  static #onlyInstance = null;
  message = "";
  element = null;

  onOver = (event) => {
    const elem = event.target.closest('[data-tooltip]');
    if (!elem) return;
    this.message = elem.dataset.tooltip;
    elem.addEventListener("pointermove", this.onMove);
    elem.addEventListener("pointerout", this.onOut, { once: true });
    this.visibleTooltip(true);
    this.render();
  };

  onOut = (event) => {
    const elem = event.target.closest('[data-tooltip]');
    if (!elem) return;
    elem.removeEventListener("pointermove", this.onMove);
    this.visibleTooltip(false);
    this.remove();
  };

  onMove = (event) => {
    this.element.style.left = event.clientX + "px";
    this.element.style.top = event.clientY + "px";
  };

  constructor() {
    if (!Tooltip.#onlyInstance) {
      Tooltip.#onlyInstance = this;
    } else {
      return Tooltip.#onlyInstance;
    }
  }

  initialize() {
    document.body.addEventListener("pointerover", this.onOver);
  }

  render() {
    const wraper = document.createElement("div");
    wraper.innerHTML = `<div class="tooltip">${this.message}</div>`;
    this.element = wraper.firstElementChild;
    document.body.append(this.element);
  }

  visibleTooltip(isVisible = false) {
    if (this.element) {
      this.element.hidden = !isVisible;   
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    document.body.removeEventListener("pointerover", this.onOver);
    this.remove();    
  }
}

export default Tooltip;
