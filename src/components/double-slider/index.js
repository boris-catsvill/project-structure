export default class DoubleSlider {
  subElements = {};

  handlePointerDown = (event) => {
    document.removeEventListener("pointermove", this.handlePointerMove);

    const element = event.target;
    const isLeft = element === this.subElements.left;
    const isRight = element === this.subElements.right;

    if (isLeft || isRight) {
      const { left, width } = this.subElements.range.getBoundingClientRect();

      this.handlePointerMove = (event) =>
        this.handleMove(isLeft, left, width, event);

      document.addEventListener("pointermove", this.handlePointerMove);
    }
  };

  handlePointerUp = () => {
    document.removeEventListener("pointermove", this.handlePointerMove);

    if (this.element) {
      this.element.dispatchEvent(
        new CustomEvent("range-select", { detail: this.selected })
      );
    }
  };

  constructor({
    min = 0,
    max = 0,
    formatValue = (value) => value,
    selected = {
      from: min,
      to: max,
    },
  } = {}) {
    this.min = min;
    this.max = max;
    this.delta = max - min;
    this.selected = selected;
    this.formatValue = formatValue;

    this.render();
  }

  get progress() {
    return {
      left: ((this.selected.from - this.min) / this.delta) * 100,
      right: (1 - (this.selected.to - this.min) / this.delta) * 100,
    };
  }

  get template() {
    return `<div class="range-slider">
    <span data-element="from">${this.formatValue(this.selected.from)}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress" style="left: ${
        this.progress.left
      }%; right: ${this.progress.right}%"></span>
      <span class="range-slider__thumb-left" style="left: ${
        this.progress.left
      }%"></span>
      <span class="range-slider__thumb-right" style="right: ${
        this.progress.right
      }%"></span>
    </div>
    <span data-element="to">${this.formatValue(this.selected.to)}</span>
  </div>`;
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initEventListeners();
  }

  initEventListeners() {
    this.element.addEventListener("pointerdown", this.handlePointerDown);
    document.addEventListener("pointerup", this.handlePointerUp);
  }

  handleMove(isLeft, startX, width, event) {
    const key = isLeft ? "from" : "to";
    const direction = isLeft ? "left" : "right";
    const delta = event.clientX - startX;
    const newPercentage = delta / width;

    let newValue = Math.round(this.delta * newPercentage) + this.min;

    if (newValue < this.min) {
      newValue = this.min;
    }
    if (newValue > this.max) {
      newValue = this.max;
    }
    if (direction === "left" && newValue > this.selected.to) {
      newValue = this.selected.to;
    }
    if (direction === "right" && newValue < this.selected.from) {
      newValue = this.selected.from;
    }

    this.selected[key] = newValue;

    this.subElements.progress.style[direction] = this.progress[direction] + "%";
    this.subElements[direction].style[direction] =
      this.progress[direction] + "%";
    this.subElements[key].innerHTML = this.formatValue(this.selected[key]);
  }

  getSubElements() {
    const result = {};

    result.range = this.element.querySelector(".range-slider__inner");
    result.progress = this.element.querySelector(".range-slider__progress");
    result.left = this.element.querySelector(".range-slider__thumb-left");
    result.right = this.element.querySelector(".range-slider__thumb-right");
    result.from = this.element.querySelector("[data-element='from']");
    result.to = this.element.querySelector("[data-element='to']");

    return result;
  }

  remove() {
    if (this.element) {
      this.element.removeEventListener("pointerdown", this.handlePointerDown);
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener("pointermove", this.handlePointerMove);
    document.removeEventListener("pointerup", this.handlePointerUp);
    this.remove();
    this.element = null;
  }
}
