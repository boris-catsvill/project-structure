export default class DoubleSlider {
  element = null;
  subElements = {};
  clickTarget = {};
  values = {};
  static MAX_PERCENT = 100;
  static MIN_PERCENT = 0;

  constructor({
    min = 0,
    max = 100,
    formatValue = (data) => `$${data}`,
    selected = {
      from: min,
      to: max,
    },
    step = 0,
  } = {}) {
    this.values = selected;
    this.selected = selected;
    this.min = min;
    this.max = max;
    this.step = step > 0 ? step : 0;
    this.formatValue = formatValue;

    this.render();
    this.init();
  }

  render() {
    this.range = this.max - this.min;
    this._left = Number(
      ((this.values.from / (this.max + this.min)) * 100).toFixed(this.step)
    );
    this._right = Number(
      ((this.values.to / (this.max + this.min)) * 100).toFixed(this.step)
    );

    const wrap = document.createElement("div");
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;

    for (const item of this.element.querySelectorAll(
      '[class^="range-slider"]'
    )) {
      this.subElements[
        item.className.replace("range-slider__", "").replace("thumb-", "")
      ] = item;
    }
    let i = 0;
    for (const item of this.element.querySelectorAll("span")) {
      if (!item.className) {
        this.subElements[i++] = item;
      }
    }
  }

  getTemplate() {
    return `  <div class="range-slider">
    <span data-element="from">${this.formatValue(this.values.from)}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress"style="left: ${this.left}%; right:${
      DoubleSlider.MAX_PERCENT - this.right
    }%"></span>
      <span class="range-slider__thumb-left" style="left: ${this.left}%"></span>
      <span class="range-slider__thumb-right" style="right:${
        DoubleSlider.MAX_PERCENT - this.right
      }%"></span>
        </div>
      <span data-element="to">${this.formatValue(this.values.to)}</span>
    </div>`;
  }

  move = (event) => {
    if (this.clickTarget === this.subElements.right) {
      this.right = this.pixelToPersent(event.clientX - this.baseCoords.x);
    }
    if (this.clickTarget === this.subElements.left) {
      this.left = this.pixelToPersent(event.clientX - this.baseCoords.x);
    }
  };

  pixelToPersent(pixel) {
    return Number(pixel / this.mousePersentStep).toFixed(this.step);
  }

  pointerDown = (event) => {
    this.baseCoords = this.subElements.inner.getBoundingClientRect();
    if (!this.baseCoords.x) {
      this.baseCoords.x = this.baseCoords.top;
    }

    this.mousePersentStep = this.baseCoords.width / DoubleSlider.MAX_PERCENT;
    this.clickTarget = event.target.closest("span");

    document.addEventListener("pointermove", this.move);
  };

  init() {
    this.subElements.left.addEventListener("pointerdown", this.pointerDown);
    this.subElements.right.addEventListener("pointerdown", this.pointerDown);
    document.addEventListener("pointerup", () => {
      this.clickTarget = {};
      document.removeEventListener("mousemove", this.move);
    });
  }

  updateVisual() {
    this.subElements.left.style.left = this.left + "%";
    this.subElements.right.style.right = `${
      DoubleSlider.MAX_PERCENT - this.right
    }%`;
    this.subElements.progress.style.left = this.left + "%";
    this.subElements.progress.style.right = `${
      DoubleSlider.MAX_PERCENT - this.right
    }%`;

    this.subElements[0].textContent = this.formatValue(this.values.from);
    this.subElements[1].textContent = this.formatValue(this.values.to);
  }

  updateValues() {
    this.values = { from: this.getFromValue(), to: this.getToValue() };
  }

  updateAll() {
    this.updateValues();
    this.updateVisual();
    this.dispatchValues();
  }

  getFromValue() {
    return Number(
      (this.min + (this.range * this.left) / DoubleSlider.MAX_PERCENT).toFixed(
        this.step
      )
    );
  }

  getToValue() {
    return Number(
      (this.min + (this.range * this.right) / DoubleSlider.MAX_PERCENT).toFixed(
        this.step
      )
    );
  }

  get left() {
    return this._left;
  }
  get right() {
    return this._right;
  }
  set left(val) {
    const oldLeft = this.left;
    if (val <= DoubleSlider.MIN_PERCENT) {
      this._left = DoubleSlider.MIN_PERCENT;
    } else if (val >= this.right) {
      this._left = this.right;
    } else {
      this._left = val;
    }
    if (oldLeft !== this.left) {
      this.updateAll();
    }
  }

  set right(val) {
    const oldRight = this.right;
    if (val >= DoubleSlider.MAX_PERCENT) {
      this._right = DoubleSlider.MAX_PERCENT;
    } else if (val <= this.left) {
      this._right = this.left;
    } else {
      this._right = val;
    }
    if (oldRight !== this.right) {
      this.updateAll();
    }
  }

  dispatchValues() {
    this.element.dispatchEvent(
      new CustomEvent("range-select", { detail: this.values, bubbles: true })
    );
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.clickTarget = {};
    this.values = {};
  }
}
