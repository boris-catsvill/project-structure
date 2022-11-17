export default class DoubleSlider {
  subElements = {};
  width;

  constructor({
                min = 0,
                max = 100,
                formatValue = value => '$' + value,
                selected = { from: min, to: max }
              } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;
    this.width = this.max - this.min;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.updateView();

    this.subElements.left.addEventListener('pointerdown', event =>
      this.onPointerDown(event, 'left')
    );
    this.subElements.right.addEventListener('pointerdown', event =>
      this.onPointerDown(event, 'right')
    );
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  updateView() {
    const { left, right, progress, from, to } = this.subElements;

    left.style.left = this.leftPercents + '%';
    right.style.right = this.rightPercents + '%';
    progress.style.left = this.leftPercents + '%';
    progress.style.right = this.rightPercents + '%';
    from.textContent = this.formatValue(this.selected.from);
    to.textContent = this.formatValue(this.selected.to);
  }

  unsubscribe() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  onPointerDown(event, thumb) {
    this.currentThumb = thumb;
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerUp = event => {
    this.unsubscribe();
    delete this.currentThumb;

    this.element.dispatchEvent(
      new CustomEvent('range-select', {
        detail: { from: this.selected.from, to: this.selected.to }
      })
    );
  };

  onPointerMove = event => {
    event.preventDefault();
    const clientRect = this.subElements.slider.getBoundingClientRect();

    const offsetX = Math.max(event.clientX - clientRect.left, 0);
    const newValue = Math.round((offsetX / clientRect.width) * this.width + this.min);

    if (this.currentThumb === 'left') {
      this.selected.from = Math.min(newValue, this.selected.to);
    } else {
      this.selected.to = Math.min(Math.max(newValue, this.selected.from), this.max);
    }

    this.updateView();
  };

  destroy() {
    this.unsubscribe();
    this.element.remove();
  }

  get template() {
    return `
      <div class="range-slider">
        <span data-element="from"></span>
        <div class="range-slider__inner" data-element="slider">
          <span class="range-slider__progress" data-element="progress"></span>
          <span class="range-slider__thumb-left" data-element="left"></span>
          <span class="range-slider__thumb-right" data-element="right"></span>
        </div>
        <span data-element="to"></span>
      </div>`;
  }

  get leftPercents() {
    return (((this.selected.from - this.min) / this.width) * 100).toFixed(1);
  }

  get rightPercents() {
    return (((this.max - this.selected.to) / this.width) * 100).toFixed(1);
  }
}
