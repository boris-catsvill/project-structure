export default class DoubleSlider {
  element;
  left;
  right;

  onPointerDown = event => {
    this.target = event.target;
    this.element.addEventListener('pointermove', this.onPointerMove);
  }

  onPointerUp = event => {
    this.element.removeEventListener('pointermove', this.onPointerMove);
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
    const range = this.element.querySelector('.range-slider__inner');
    const rect = range.getBoundingClientRect();
    const x = event.clientX;

    if (x < rect.left || x > rect.right) {
      return;
    }

    if (this.target === this.left) {
      const percent = (x - rect.left) / rect.width;
      this.updateLeft(percent);
    }

    if (this.target === this.right) {
      const percent = (rect.right - x) / rect.width;
      this.updateRight(percent);
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
    const left = this.getLeft();
    const right = this.getRight();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="range-slider">
            <span data-element="from">${this.formatValue(this.selected.from)}</span>
            <div class="range-slider__inner">
                <span class="range-slider__progress" style="left: ${left}; right: ${right}"></span>
                <span class="range-slider__thumb-left" style="left: ${left}"></span>
                <span class="range-slider__thumb-right" style="right: ${right}"></span>
            </div>
            <span data-element="to">${this.formatValue(this.selected.to)}</span>
        </div>
    `;

    this.element = wrapper.firstElementChild;
    this.left = this.element.querySelector('.range-slider__thumb-left');
    this.right = this.element.querySelector('.range-slider__thumb-right');
  }

  reset() {
    this.updateLeft(0);
    this.updateRight(0);
  }

  initEventListeners() {
    this.left.addEventListener('pointerdown', this.onPointerDown);
    this.right.addEventListener('pointerdown', this.onPointerDown);
    this.element.addEventListener('pointerup', this.onPointerUp);
  }

  updateLeft(percent) {
    this.calculateSelectedFrom(percent);
    this.element.querySelector('[data-element="from"]').textContent = this.formatValue(this.selected.from);

    const left = this.getLeft();
    this.element.querySelector('.range-slider__progress').style.left = left;
    this.element.querySelector('.range-slider__thumb-left').style.left = left;
  }

  updateRight(percent) {
    this.calculateSelectedTo(percent);
    this.element.querySelector('[data-element="to"]').textContent = this.formatValue(this.selected.to);

    const right = this.getRight();
    this.element.querySelector('.range-slider__progress').style.right = right;
    this.element.querySelector('.range-slider__thumb-right').style.right = right;
  }

  getLeft() {
    return (100 * (this.selected.from - this.min) / (this.max - this.min)).toFixed(0) + '%';
  }

  getRight() {
    return (100 * (this.max - this.selected.to) / (this.max - this.min)).toFixed(0) + '%';
  }

  calculateSelectedFrom(percent) {
    const range = this.max - this.min;
    this.selected.from = Math.min(this.selected.to, this.min + Math.round(percent * range));
  }

  calculateSelectedTo(percent) {
    const range = this.max - this.min;
    this.selected.to = Math.max(this.selected.from, this.max - Math.round(percent * range));
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
