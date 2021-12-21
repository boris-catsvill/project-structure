import Component from "../../utils/component";

export default class DoubleSlider extends Component {
  onThumbPointerMove = event => {
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

  constructor({
    min = 100,
    max = 200,
    formatValue = value => '$' + value,
    selected = {
      from: min,
      to: max
    }
  } = {}) {
    super();

    this.min = min;
    this.max = max;

    this.formatValue = formatValue;

    this.selected = selected;
  }

  setInitalState = ({ from, to } = {}) => {
    const { thumbLeft, thumbRight, progress, from: fromSpanElem, to: toSpanElem, } = this.subElements;

    thumbLeft.style.left = `0%`;
    thumbRight.style.right = `0%`;
    progress.style.left = `0%`;
    progress.style.right = `0%`;
    fromSpanElem.innerHTML = `${this.formatValue(from)}`;
    toSpanElem.innerHTML = `${this.formatValue(to)}`;
  }

  get template() {
    const { from, to } = this.selected;
    return (
      `<div class="range-slider">
        <span data-element="from">${this.formatValue(from)}</span>
        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress" style="left: 0%; right: 0%"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: 0%"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right" style="right: 0%"></span>
        </div>
        <span data-element="to">${this.formatValue(to)}</span>
      </div>
        `
    );
  }

  onThumbPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.getValue(),
      bubbles: true
    }));
  };

  initEventListeners() {
    const { thumbLeft, thumbRight } = this.subElements;

    thumbLeft.addEventListener('pointerdown', event => this.onThumbPointerDown(event));
    thumbRight.addEventListener('pointerdown', event => this.onThumbPointerDown(event));
  }


  removeEventListeners() {
    const { thumbLeft, thumbRight } = this.subElements;

    thumbLeft.removeEventListener('pointerdown', event => this.onThumbPointerDown(event));
    thumbRight.removeEventListener('pointerdown', event => this.onThumbPointerDown(event));

    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);
  }

  render() {
    this.update();
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

  onThumbPointerDown(event) {
    const thumbElem = event.target;

    event.preventDefault();

    const { left, right } = thumbElem.getBoundingClientRect();

    if (thumbElem === this.subElements.thumbLeft) {
      this.shiftX = right - event.clientX;
    } else {
      this.shiftX = left - event.clientX;
    }

    this.dragging = thumbElem;

    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onThumbPointerMove);
    document.addEventListener('pointerup', this.onThumbPointerUp);
  }

  getValue() {
    const rangeTotal = this.max - this.min;
    const { left } = this.subElements.thumbLeft.style;
    const { right } = this.subElements.thumbRight.style;

    const from = Math.round(this.min + parseFloat(left) * 0.01 * rangeTotal);
    const to = Math.round(this.max - parseFloat(right) * 0.01 * rangeTotal);

    return { from, to };
  }
}