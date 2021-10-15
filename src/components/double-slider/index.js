export default class DoubleSlider {
  element;
  subElements = {};

  onPointerDown = event => {
    this.target = event.target;
    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointerup', this.onPointerUp);
    this.element.addEventListener('pointermove', this.onPointerMove);
  }

  onPointerUp = () => {
    this.element.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.element.classList.remove('range-slider_dragging');
    this.target = null;

    this.element.dispatchEvent(new CustomEvent('range-select', {
      bubbles: true,
      detail: {
        from: this.selected.from,
        to: this.selected.to
      }
    }));
  }

  onPointerMove = event => {
    const {left, right, width} = this.subElements.inner.getBoundingClientRect();
    const x = event.clientX;

    if (this.target === this.subElements.thumbLeft) {
      this.updateLeft(x < left ? 0 : (x - left) / width);
    }

    if (this.target === this.subElements.thumbRight) {
      this.updateRight(x > right ? 0 : (right - x) / width);
    }
  }

  constructor({
                min = 0,
                max = 100,
                formatValue = value => value,
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
    this.initEventListeners();
  }

  render() {
    const left = this.getPercentLeft();
    const right = this.getPercentRight();

    this.element = document.createElement('div');
    this.element.innerHTML = `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress" style="left: ${left}; right: ${right}"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${left}"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${right}"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;

    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const result = {};

    for (const subElement of element.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  reset() {
    this.updateLeft(0);
    this.updateRight(0);
  }

  initEventListeners() {
    this.subElements.thumbLeft.addEventListener('pointerdown', this.onPointerDown);
    this.subElements.thumbRight.addEventListener('pointerdown', this.onPointerDown);
  }

  updateLeft(ratio) {
    this.selected.from = this.calculateSelectedFrom(ratio);
    this.subElements.from.textContent = this.formatValue(this.selected.from);

    const left = this.getPercentLeft();
    this.subElements.progress.style.left = left;
    this.subElements.thumbLeft.style.left = left;
  }

  updateRight(ratio) {
    this.selected.to = this.calculateSelectedTo(ratio);
    this.subElements.to.textContent = this.formatValue(this.selected.to);

    const right = this.getPercentRight();
    this.subElements.progress.style.right = right;
    this.subElements.thumbRight.style.right = right;
  }

  getPercentLeft() {
    return 100 * (this.selected.from - this.min) / (this.max - this.min) + '%';
  }

  getPercentRight() {
    return 100 * (this.max - this.selected.to) / (this.max - this.min) + '%';
  }

  calculateSelectedFrom(ratio) {
    const from = this.min + (this.max - this.min) * ratio;
    return Math.min(this.selected.to, Math.round(from));
  }

  calculateSelectedTo(ratio) {
    const to = this.max - (this.max - this.min) * ratio;
    return Math.max(this.selected.from, Math.round(to));
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
  }
}
