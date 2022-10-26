export default class DoubleSlider {
  element;
  subElements = {};
  dragging;

  constructor({
    min = 50,
    max = 150,
    formatValue = value => '$' + value,
    selected = { from: min, to: max }
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;
    this.subtractionRange = max - min;

    this.render();
    this.initEventListeners();
  }

  setSelectedRangeValue({ from = this.selected.from, to = this.selected.to } = {}) {
    this.selected.from = from;
    this.selected.to = to;
    this.update();
  }

  setFromRangeValue(min) {
    this.selected.from = min;
    this.update();
  }

  setToRangeValue(max) {
    this.selected.to = max;
    this.update();
  }

  get templateHTMLComponent() {
    return `<div class="range-slider">
    <span data-element="from"></span>
    <div data-element="inner" class="range-slider__inner">
      <span class="range-slider__progress" data-element="progress" style="left: 0; right: 0">
      </span>
      <span class="range-slider__thumb-left" data-element="thumbLeft" style="left: 0">
      </span>
      <span class="range-slider__thumb-right" data-element="thumbRight" style="right: 0">
      </span>
    </div>
    <span data-element="to"></span>
  </div>`;
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.templateHTMLComponent;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.update();
  }

  update() {
    const { thumbLeft, thumbRight, progress, from, to } = this.subElements;

    thumbLeft.style.left = this.leftPercents + '%';
    thumbRight.style.right = this.rightPercents + '%';
    progress.style.left = this.leftPercents + '%';
    progress.style.right = this.rightPercents + '%';

    from.innerHTML = this.formatValue(this.selected.from.toFixed(0));
    to.innerHTML = this.formatValue(this.selected.to.toFixed(0));
  }

  initEventListeners() {
    this.subElements.thumbLeft.addEventListener('pointerdown', this.onThumbPointerDownHandler);
    this.subElements.thumbRight.addEventListener('pointerdown', this.onThumbPointerDownHandler);
  }

  onThumbPointerDownHandler = e => {
    e.preventDefault();

    this.dragging = e.target;
    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onThumbPointerMoveHandler);
    document.addEventListener('pointerup', this.onThumbPointerUpHandler);
  };

  onThumbPointerMoveHandler = e => {
    e.preventDefault();
    const { inner, thumbLeft, thumbRight } = this.subElements;
    const { left: innerBoundingLeft, width: innerBoundingWidth } = inner.getBoundingClientRect();

    const offsetX = Math.max(e.clientX - innerBoundingLeft, 0);
    const newValue = Math.round((offsetX / innerBoundingWidth) * this.subtractionRange + this.min);

    if (this.dragging === thumbLeft) {
      this.selected.from = Math.min(newValue, this.selected.to);
    }
    if (this.dragging === thumbRight) {
      this.selected.to = Math.min(Math.max(newValue, this.selected.from), this.max);
    }

    this.update();
  };

  onThumbPointerUpHandler = e => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onThumbPointerMoveHandler);
    document.removeEventListener('pointerup', this.onThumbPointerUpHandler);

    this.element.dispatchEvent(
      new CustomEvent('range-select', {
        detail: this.getValues(),
        bubbles: true
      })
    );
  };

  getValues() {
    return { from: this.selected.from, to: this.selected.to };
  }

  getSubElements(parent = this.element) {
    const result = {};
    const elementsDOM = parent.querySelectorAll('[data-element]');

    for (const subElement of elementsDOM) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  get leftPercents() {
    return ((this.selected.from - this.min) / this.subtractionRange) * 100;
  }

  get rightPercents() {
    return ((this.max - this.selected.to) / this.subtractionRange) * 100;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    document.removeEventListener('pointerdown', this.onThumbPointerDownHandler);
    document.removeEventListener('pointermove', this.onThumbPointerMoveHandler);
    document.removeEventListener('pointerup', this.onThumbPointerUpHandler);

    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
