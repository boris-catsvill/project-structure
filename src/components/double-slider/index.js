export default class DoubleSlider {

  element;
  from;
  inner;
  progress;
  thumbLeft;
  thumbRight;
  to;
  target;

  constructor({
    min = 300,
    max = 800,
    selected = {
      from: 400,
      to: 600
    },
    formatValue = value => '$' + value,
  } = {}) {
    this.min = min;
    this.max = max;
    this.total = max - min;
    this.formatValue = formatValue;
    this.selected = selected;
    this.init();
  }

  init() {
    const element = document.createElement('div');
    element.innerHTML = this.getContent();
    this.element = element.firstElementChild;
    const subElements = this.element.querySelectorAll('[data-element]');
    for (const item of subElements) {
      this[item.dataset.element] = item;
    }
    this.thumbLeft.addEventListener('pointerdown', this.pointerDownEvent);
    this.thumbRight.addEventListener('pointerdown', this.pointerDownEvent);

    const left = Math.floor((this.selected.from - this.min) / this.total * 100) + '%';
    const right = Math.floor((this.max - this.selected.to) / this.total * 100) + '%';

    this.thumbLeft.style.left = left;
    this.thumbRight.style.right = right;
    this.progress.style.left = left;
    this.progress.style.right = right;
  }

  getContent() {
    return `<div class="range-slider">
              <span data-element="from">${this.formatValue(this.selected.from)}</span>
              <div data-element="inner" class="range-slider__inner">
                <span data-element="progress" class="range-slider__progress"></span>
                <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                <span data-element="thumbRight" class="range-slider__thumb-right"></span>
              </div>
              <span data-element="to">${this.formatValue(this.selected.to)}</span>
            </div>`;
  }

  pointerDownEvent = event => {
    event.preventDefault();
    this.target = event.target;
    const { left, right } = this.target.getBoundingClientRect();
    if (this.target === this.thumbLeft) {
      this.shiftX = right - event.clientX;
    } else {
      this.shiftX = left - event.clientX;
    }
    this.element.classList.add('range-slider_dragging');
    document.addEventListener('pointerup', this.pointerUpEvent);
    document.addEventListener('pointermove', this.pointerMoveEvent);
  }

  pointerUpEvent = () => {
    document.removeEventListener('pointermove', this.pointerMoveEvent);
    document.removeEventListener('pointerup', this.pointerUpEvent);
    this.element.classList.remove('range-slider_dragging');
    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: {from: this.getLeftVal(), to: this.getRightVal()},
      bubbles: true
    }));
  };

  pointerMoveEvent = event => {
    event.preventDefault();
    const { left, right, width } = this.inner.getBoundingClientRect();

    if (this.target === this.thumbLeft) {
      this.moveLeft(left, width, event.clientX);
    }

    if (this.target === this.thumbRight) {
      this.moveRight(right, width, event.clientX);
    }
  };

  moveLeft(left, width, clientX) {
    left = (clientX - left + this.shiftX) / width;
    left = (left < 0 ? 0 : left) * 100;
    const right = parseFloat(this.thumbRight.style.right);
    if (left + right > 100) {
      left = 100 - right;
    }
    this.target.style.left = this.progress.style.left = left + '%';
    this.from.innerHTML = this.formatValue(this.getLeftVal());
  }

  moveRight(right, width, clientX) {
    right = (right - clientX - this.shiftX) / width;
    right = (right < 0 ? 0 : right) * 100;
    const left = parseFloat(this.thumbLeft.style.left);
    if (left + right > 100) {
      right = 100 - left;
    }
    this.target.style.right = this.progress.style.right = right + '%';
    this.to.innerHTML = this.formatValue(this.getRightVal());
  }

  getLeftVal() {
    return Math.round(this.min + parseFloat(this.thumbLeft.style.left) * 0.01 * this.total);
  }

  getRightVal() {
    return Math.round(this.max - parseFloat(this.thumbRight.style.right) * 0.01 * this.total);
  }

  destroy() {
    document.removeEventListener('pointermove', this.pointerMoveEvent);
    document.removeEventListener('pointerup', this.pointerUpEvent);
    this.element?.remove();
  }

  reInit(from, to){
    this.progress.style.left = 0 + "%";
    this.progress.style.right = 0 + "%";
    this.thumbLeft.style.left = 0 + "%";
    this.thumbRight.style.right = 0 + "%";
    this.from.innerHTML = this.formatValue(from);
    this.to.innerHTML = this.formatValue(to)
  }

}
