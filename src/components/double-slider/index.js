export default class DoubleSlider {
  element;
  subElements = {};

  constructor({
    min = 10,
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

    this.moveLeft = this.moveLeft.bind(this);
    this.moveRight = this.moveRight.bind(this);

    this.render();
    this.initEventListeners();
  }

  get selectedPercent() {
    return {
      from: parseInt(((this.selected.from - this.min) / (this.max - this.min) * 100).toFixed()),
      to: 100 - (this.selected.to / this.max * 100).toFixed()
    };
  }

  get template() {
    return `<div class="range-slider">
    <span data-element="from">${this.formatValue(this.selected.from)}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress"
      style="left: ${this.selectedPercent.from}%; right: ${this.selectedPercent.to}%"></span>
      <span class="range-slider__thumb-left" style="left: ${this.selectedPercent.from}%"></span>
      <span class="range-slider__thumb-right" style="right: ${this.selectedPercent.to}%"></span>
    </div>
    <span data-element="to">${this.formatValue(this.selected.to)}</span>
  </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const result = {};

    result.rangeSlider = element.querySelector('.range-slider');
    result.inner = element.querySelector('.range-slider__inner');
    result.from = element.querySelector('[data-element="from"]');

    result.progress = element.querySelector('.range-slider__progress');
    result.thumbLeft = element.querySelector('.range-slider__thumb-left');
    result.thumbRight = element.querySelector('.range-slider__thumb-right');

    result.to = element.querySelector('[data-element="to"]');

    return result;
  }

  leftPointerdown() {
    this.element.removeEventListener('pointermove', this.moveRight);
    this.element.addEventListener('pointermove', this.moveLeft);

    this.element.addEventListener('pointerup', () => {
      const { from, to } = this.selected;
      this.element.dispatchEvent(new CustomEvent('range-select',
        {
          bubbles: true,
          detail: {
            from: parseInt(from),
            to: parseInt(to),
          }
        }));
      this.element.removeEventListener('pointermove', this.moveLeft);
    });
  }

  rightPointerdown() {
    this.element.removeEventListener('pointermove', this.moveLeft);
    this.element.addEventListener('pointermove', this.moveRight);

    this.element.addEventListener('pointerup', () => {
      const { from, to } = this.selected;
      this.element.dispatchEvent(new CustomEvent('range-select',
        {
          bubbles: true,
          detail: {
            from: parseInt(from),
            to: parseInt(to),
          }
        }));
      this.element.removeEventListener('pointermove', this.moveRight);
    });
  }

  moveLeft(event) {
    const coordinates = this.subElements.inner.getBoundingClientRect();
    const progressWidth = coordinates.width;
    const nextLeft = coordinates.x ? event.clientX - coordinates.x : event.clientX;

    if (nextLeft >= 0 && nextLeft <= progressWidth) {
      const nextLeftPart = progressWidth !== 0 ? nextLeft / progressWidth : nextLeft;

      this.selected.from = (nextLeftPart * (this.max - this.min) + this.min).toFixed();
      this.subElements.thumbLeft.style.left = this.selectedPercent.from + '%';
      this.subElements.progress.style.left = this.selectedPercent.from + '%';
      this.subElements.from.innerHTML = this.formatValue(this.selected.from);
    }
  }

  moveRight(event) {
    const coordinates = this.subElements.inner.getBoundingClientRect();
    const progressWidth = coordinates.width;
    const nextLeft = coordinates.x ? event.clientX - coordinates.x : event.clientX;

    if (nextLeft >= 0 && nextLeft <= progressWidth) {
      const nextLeftPart = progressWidth !== 0 ? nextLeft / progressWidth : nextLeft;

      this.selected.to = (nextLeftPart * this.max).toFixed();
      this.subElements.thumbRight.style.right = this.selectedPercent.to + '%';
      this.subElements.progress.style.right = this.selectedPercent.to + '%';
      this.subElements.to.innerHTML = this.formatValue(this.selected.to);
    }
  }

  initEventListeners() {
    this.subElements.thumbLeft.addEventListener('pointerdown', (event) => {
      this.leftPointerdown(event);
    });

    this.subElements.thumbRight.addEventListener('pointerdown', (event) => {
      this.rightPointerdown(event);
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
