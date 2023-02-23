export default class DoubleSlider {
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
    const sliderWrapper = document.createElement('div');
    sliderWrapper.innerHTML = this.getRangeSliderHTML();
    this.element = sliderWrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.subElements.thumbLeft.addEventListener('pointerdown', event => this.onPointerDown(event));
    this.subElements.thumbRight.addEventListener('pointerdown', event => this.onPointerDown(event));

    this.update();
  }

  getRangeSliderHTML() {
    return `
			<div data-element="rangeSlider" class="range-slider">
				<span data-element="from">${this.formatValue(this.selected.from)}</span>
				<div data-element="inner" class="range-slider__inner">
					<span data-element="progress" class="range-slider__progress"></span>
					<span data-element="thumbLeft" class="range-slider__thumb-left"></span>
					<span data-element="thumbRight" class="range-slider__thumb-right"></span>
				</div>
				<span data-element="to">${this.formatValue(this.selected.to)}</span>
			</div>`;
  }

  getSubElements() {
    const result = {};
    this.element.querySelectorAll("[data-element]").forEach(subElement => {
      result[subElement.dataset.element] = subElement;
    });
    return result;
  }

  update() {
    const rangeTotal = this.max - this.min;
    const left = Math.floor((this.selected.from - this.min) / rangeTotal * 100) + '%';
    const right = Math.floor((this.max - this.selected.to) / rangeTotal * 100) + '%';

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;

    this.subElements.thumbLeft.style.left = left;
    this.subElements.thumbRight.style.right = right;
  }

  onPointerDown(event) {
    event.preventDefault();

    const thumbElem = event.target;
    const { left, right } = thumbElem.getBoundingClientRect();

    this.shiftX = thumbElem === this.subElements.thumbLeft ? right - event.clientX : left - event.clientX;
    this.dragging = thumbElem;

    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = event => {
    event.preventDefault();

    const { left: innerLeft, right: innerRight, width } = this.subElements.inner.getBoundingClientRect();

    if (this.dragging === this.subElements.thumbLeft) {
      let newLeft = (event.clientX - innerLeft + this.shiftX) / width;

      if (newLeft < 0) {
        newLeft = 0;
      }
      newLeft *= 100;

      const right = parseFloat(this.subElements.thumbRight.style.right);
      if (newLeft + right > 100) {
        newLeft = 100 - right;
      }

      this.dragging.style.left = this.subElements.progress.style.left = newLeft + '%';
      this.subElements.from.innerHTML = this.formatValue(this.getValue().from);
    }

    if (this.dragging === this.subElements.thumbRight) {
      let newRight = (innerRight - event.clientX - this.shiftX) / width;

      if (newRight < 0) {
        newRight = 0;
      }
      newRight *= 100;

      const left = parseFloat(this.subElements.thumbLeft.style.left);
      if (left + newRight > 100) {
        newRight = 100 - left;
      }

      this.dragging.style.right = this.subElements.progress.style.right = newRight + '%';
      this.subElements.to.innerHTML = this.formatValue(this.getValue().to);
    }
  };

  onPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.getValue(),
      bubbles: true
    }));
  };

  getValue() {
    const rangeTotal = this.max - this.min;
    const { left } = this.subElements.thumbLeft.style;
    const { right } = this.subElements.thumbRight.style;

    const from = Math.round(this.min + parseFloat(left) * 0.01 * rangeTotal);
    const to = Math.round(this.max - parseFloat(right) * 0.01 * rangeTotal);

    return { from, to };
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.subElements.thumbLeft.removeEventListener('pointerdown', event => this.onPointerDown(event));
    this.subElements.thumbRight.removeEventListener('pointerdown', event => this.onPointerDown(event));
    this.remove();
    this.subElements = {};
  }
}
