export default class DoubleSlider {
  element;
  subElements = {};
  
  movingElement;
  initCoordX = 0;

  constructor({
    min = 100,
    max = 200,
    formatValue = value => '$' + value,
    selected = {
      from: min,
      to: max,
    }
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
  }

  addEventListeners() {
    this.subElements.sliderLeft.addEventListener('pointerdown', event => this.onPointerDown(event));
    this.subElements.sliderRight.addEventListener('pointerdown', event => this.onPointerDown(event));
  }

  onPointerDown = event => {
    event.preventDefault();
    
    const currentSlider = event.target;
    const { left, right } = currentSlider.getBoundingClientRect();

    if (currentSlider === this.subElements.sliderLeft) {
      this.initCoordX = right - event.clientX;
    } else {
      this.initCoordX = left - event.clientX;
    }

    this.movingElement = currentSlider;

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = event => {
    event.preventDefault();

    const { left, right, width } = this.subElements.slider.getBoundingClientRect();

    if (this.movingElement === this.subElements.sliderRight) {
      let currentRight = (right - event.clientX - this.initCoordX) / width;

      if (currentRight < 0) {
        currentRight = 0;
      }
      currentRight *= 100;

      const stopLeft = parseFloat(this.subElements.sliderLeft.style.left);
      if (stopLeft + currentRight > 100) {
        currentRight = 100 - stopLeft;
      }
      this.movingElement.style.right = this.subElements.progress.style.right = currentRight + '%';
      this.subElements.to.innerHTML = this.formatValue(this.calculateValue().to);
    }

    if (this.movingElement === this.subElements.sliderLeft) {
      let currentLeft = (event.clientX - left + this.initCoordX) / width;

      if (currentLeft < 0) {
        currentLeft = 0;
      }
      currentLeft *= 100;

      const stopRight = parseFloat(this.subElements.sliderRight.style.right);
      if (currentLeft + stopRight > 100) {
        currentLeft = 100 - stopRight;
      }

      this.movingElement.style.left = this.subElements.progress.style.left = currentLeft + '%';
      this.subElements.from.innerHTML = this.formatValue(this.calculateValue().from);
    }
  }

  onPointerUp = () => {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.calculateValue(),
      bubbles: true,
    }))
  }

  calculateValue() {
    const { left } = this.subElements.sliderLeft.style;
    const { right } = this.subElements.sliderRight.style;

    const from = Math.round(this.min + parseFloat(left) * (this.max - this.min) * 0.01);
    const to = Math.round(this.max - parseFloat(right) * (this.max - this.min) * 0.01);

    return { from, to }
  }

  reset() {
    console.log(this.subElements.from)
    console.log(this.subElements.to)
    this.subElements.from.innerHTML = this.formatValue(this.min);
    this.subElements.to.innerHTML = this.formatValue(this.max)

    const left = '0%';
    const right = '0%';

    this.subElements.sliderLeft.style.left = left;
    this.subElements.sliderRight.style.right = right;

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;
  }

  update() {
    const left = Math.floor((this.selected.from - this.min) / (this.max - this.min) * 100) + '%';
    const right = Math.floor((this.max - this.selected.to) / (this.max - this.min) * 100) + '%';

    this.subElements.sliderLeft.style.left = left;
    this.subElements.sliderRight.style.right = right;

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    
    this.element.ondragstart = () => false;
    this.addEventListeners();

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
    `
  }

  getSubElements() {
    const result = {};
    const subElements = this.element.querySelectorAll('[data-element]');

    for (const subElement of subElements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }
}