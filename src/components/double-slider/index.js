export default class DoubleSlider {
  element;
  subElements = {};

  dynamicSlider;
  initX = 0;

  constructor({
    min = 100,
    max = 200,
    formatValue = value => '$' + value,
    selected = {
      from: min,
      to: max
    }
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.element.ondragstart = () => false;
    this.initEventListeners();

    this.update();
  }

  getTemplate() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div data-element="slider" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress"></span>
          <span data-element="sliderLeft" class="range-slider__thumb-left"></span>
          <span data-element="sliderRight" class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;
  }

  initEventListeners() {
    this.subElements.sliderLeft.addEventListener('pointerdown', event => this.onSliderDown(event));
    this.subElements.sliderRight.addEventListener('pointerdown', event => this.onSliderDown(event));
  }

  onSliderDown = event => {
    event.preventDefault();

    const currentSlider = event.target;
    const { left, right } = currentSlider.getBoundingClientRect();

    if (currentSlider === this.subElements.sliderLeft) {
      this.initX = right - event.clientX;
    } else {
      this.initX = left - event.clientX;
    }

    this.dynamicSlider = currentSlider;

    document.addEventListener('pointermove', this.onSliderMove);
    document.addEventListener('pointerup', this.onSliderUp);
  };

  onSliderMove = event => {
    event.preventDefault();

    const { left, right, width } = this.subElements.slider.getBoundingClientRect();

    if (this.dynamicSlider === this.subElements.sliderRight) {
      let currentRight = (right - event.clientX - this.initX) / width;

      if (currentRight < 0) {
        currentRight = 0;
      }
      currentRight *= 100;

      const stopLeft = parseFloat(this.subElements.sliderLeft.style.left);
      if (stopLeft + currentRight > 100) {
        currentRight = 100 - stopLeft;
      }
      this.dynamicSlider.style.right = this.subElements.progress.style.right = currentRight + '%';
      this.subElements.to.innerHTML = this.formatValue(this.calcDiff().to);
    }

    if (this.dynamicSlider === this.subElements.sliderLeft) {
      let currentLeft = (event.clientX - left + this.initX) / width;

      if (currentLeft < 0) {
        currentLeft = 0;
      }
      currentLeft *= 100;

      const stopRight = parseFloat(this.subElements.sliderRight.style.right);
      if (currentLeft + stopRight > 100) {
        currentLeft = 100 - stopRight;
      }

      this.dynamicSlider.style.left = this.subElements.progress.style.left = currentLeft + '%';
      this.subElements.from.innerHTML = this.formatValue(this.calcDiff().from);
    }
  };

  onSliderUp = () => {
    document.removeEventListener('pointermove', this.onSliderMove);
    document.removeEventListener('pointerup', this.onSliderUp);

    this.element.dispatchEvent(
      new CustomEvent('range-select', {
        detail: this.calcDiff(),
        bubbles: true
      })
    );
  };

  calcDiff() {
    const { left } = this.subElements.sliderLeft.style;
    const { right } = this.subElements.sliderRight.style;

    const from = Math.round(this.min + parseFloat(left) * (this.max - this.min) * 0.01);
    const to = Math.round(this.max - parseFloat(right) * (this.max - this.min) * 0.01);

    return { from, to };
  }

  update(reset = false) {
    let left;
    let right;
    if (reset) {
      this.subElements.from.innerHTML = this.formatValue(this.min);
      this.subElements.to.innerHTML = this.formatValue(this.max);
      left = '0%';
      right = '0%';
    } else {
      left = Math.floor(((this.selected.from - this.min) / (this.max - this.min)) * 100) + '%';
      right = Math.floor(((this.max - this.selected.to) / (this.max - this.min)) * 100) + '%';
    }
    this.subElements.sliderLeft.style.left = left;
    this.subElements.sliderRight.style.right = right;

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;
  }

  reset() {
    this.subElements.from.innerHTML = this.formatValue(this.min);
    this.subElements.to.innerHTML = this.formatValue(this.max);

    this.subElements.sliderLeft.style.left = '0%';
    this.subElements.sliderRight.style.right = '0%';

    this.subElements.progress.style.left = '0%';
    this.subElements.progress.style.right = '0%';
  }

  getSubElements() {
    const subElements = {};
    const elementsAll = this.element.querySelectorAll('[data-element]');
    for (const subElement of elementsAll) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }
    return subElements;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    document.removeEventListener('pointermove', this.onSliderMove);
    document.removeEventListener('pointerup', this.onSliderUp);
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
