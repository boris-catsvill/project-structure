export default class DoubleSlider {
  element;
  subElements = {};
  activeThumb;

  startMooving = event => {
    this.activeThumb = event.target;
    event.preventDefault();

    const { left, right } = this.activeThumb.getBoundingClientRect();

    if (this.activeThumb === this.subElements.leftThumb) {
      this.shiftX = right - event.clientX;
    } else {
      this.shiftX = left - event.clientX;
    }
    this.element.classList.add('range-slider_dragging');
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  };

  onPointerMove = event => {
    event.preventDefault();

    const {
      left: leftBorder,
      right: rightBorder,
      width
    } = this.subElements.slider.getBoundingClientRect();

    if (this.activeThumb === this.subElements.leftThumb) {
      let newLeft = (event.clientX - leftBorder + this.shiftX) / width;
      if (newLeft < 0) {
        newLeft = 0;
      }
      newLeft *= 100;
      const right = parseFloat(this.subElements.rightThumb.style.right);
      if (newLeft + right > 100) {
        newLeft = 100 - rightBorder;
      }
      this.activeThumb.style.left = this.subElements.progressBar.style.left = newLeft + '%';
      this.subElements.from.innerHTML = this.formatValue(this.getPercent().from);
    }

    if (this.activeThumb === this.subElements.rightThumb) {
      let newRight = (rightBorder - event.clientX - this.shiftX) / width;

      if (newRight < 0) {
        newRight = 0;
      }
      newRight *= 100;

      const left = parseFloat(this.subElements.leftThumb.style.left);

      if (left + newRight > 100) {
        newRight = 100 - left;
      }
      this.activeThumb.style.right = this.subElements.progressBar.style.right = newRight + '%';
      this.subElements.to.innerHTML = this.formatValue(this.getPercent().to);
    }
  };

  onPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');
    this.element.removeEventListener('pointermove', this.onPointerMove);
    this.element.removeEventListener('pointerup', this.onPointerUp);
    this.element.dispatchEvent(
      new CustomEvent('range-select', {
        detail: this.getPercent(),
        bubbles: true
      })
    );
  };

  constructor({ min = 100, max = 200, formatValue = value => '$' + value, selected = {} } = {}) {
    this.formatValue = formatValue;
    this.min = min;
    this.max = max;
    this.from = selected.from || this.min;
    this.to = selected.to || this.max;

    this.render();
  }
  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
    this.update();
  }

  get getTemplate() {
    return `<div class="range-slider ">
    <span data-element="from">${this.formatValue(this.from)}</span>
    <div class="range-slider__inner" data-element="slider">
    <span class="range-slider__progress" data-element="progressBar" ></span>
    <span class="range-slider__thumb-left" data-element="leftThumb" ></span>
    <span class="range-slider__thumb-right" data-element="rightThumb"></span>
    </div>
    <span data-element="to">${this.formatValue(this.to)}</span>
  </div>`;
  }

  getPercent() {
    const rangeTotal = this.max - this.min;
    const { left } = this.subElements.leftThumb.style;
    const { right } = this.subElements.rightThumb.style;
    const from = Math.round(this.min + parseFloat(left) * 0.01 * rangeTotal);
    const to = Math.round(this.max - parseFloat(right) * 0.01 * rangeTotal);

    return { from, to };
  }

  update() {
    const diff = this.max - this.min;
    const rangeTotal = diff > 0 ? diff : 1;

    const left = this.getLeftShift(rangeTotal) + '%';
    const right = this.getRightShift(rangeTotal) + '%';

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;

    this.subElements.thumbLeft.style.left = left;
    this.subElements.thumbRight.style.right = right;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const elem of elements) {
      const name = elem.dataset.element;
      result[name] = elem;
    }

    return result;
  }

  initEventListeners() {
    this.subElements.leftThumb.addEventListener('pointerdown', this.startMooving);
    this.subElements.rightThumb.addEventListener('pointerdown', this.startMooving);
  }
  update() {
    const diff = this.max - this.min;
    const rangeTotal = diff > 0 ? diff : 1;

    const left = this.getLeftShift(rangeTotal) + '%';
    const right = this.getRightShift(rangeTotal) + '%';

    this.subElements.progressBar.style.left = left;
    this.subElements.progressBar.style.right = right;

    this.subElements.leftThumb.style.left = left;
    this.subElements.rightThumb.style.right = right;
  }
  getLeftShift(rangeTotal) {
    return Math.floor(((this.from - this.min) / rangeTotal) * 100);
  }

  getRightShift(rangeTotal) {
    return Math.floor(((this.max - this.to) / rangeTotal) * 100);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }
}
