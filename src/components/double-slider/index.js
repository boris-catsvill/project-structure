import { BaseComponent } from '../../base-component';
import { CUSTOM_EVENTS } from '../../constants';

export default class DoubleSlider extends BaseComponent {
  activeSide;
  shift = {};
  startPosition = {};

  constructor({
    min = 10,
    max = 100,
    selected = { from: min, to: max },
    formatValue = value => value
  } = {}) {
    super();
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;
    this.setShift(this.min, this.max, this.selected);
    this.render();
  }

  get template() {
    return `<div class='range-slider'>
                <span data-element='from'>${this.formatValue(this.selected.from)}</span>
                <div data-element='inner' class='range-slider__inner'>
                    <span class='range-slider__progress' data-element='progress' style='left: ${
                      this.shift.left
                    }%; right: ${this.shift.right}%'></span>
                    <span class='range-slider__thumb-left' data-element='left' style='left: ${
                      this.shift.left
                    }%'></span>
                    <span class='range-slider__thumb-right' data-element='right' style='right: ${
                      this.shift.right
                    }%'></span>
                </div>
                <span data-element='to'>${this.formatValue(this.selected.to)}</span>
            </div>`;
  }

  onPointerDown({ target, clientX }) {
    const activeSide = target.dataset.element;
    const notActiveSide = activeSide === 'right' ? 'left' : 'right';
    const { left, right, width } = this.subElements.inner.getBoundingClientRect();
    const shift = target.getBoundingClientRect()[notActiveSide] - clientX;

    this.startPosition = {
      left: left + shift,
      right: right + shift,
      width
    };
    this.activeSide = activeSide;
    this.element.classList.add('range-slider_dragging');
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);
    this.shift[this.activeSide] = parseFloat(this.subElements.progress.style[this.activeSide]);
    this.activeSide = '';
    this.dispatch();
  };

  onPointerMove = ({ clientX }) => {
    const isLeft = this.activeSide === 'left';
    const activeSide = this.activeSide;
    const notActiveSide = isLeft ? 'right' : 'left';
    const startPosition = this.startPosition[activeSide];

    const end = 100 - this.shift[notActiveSide];

    const diff = isLeft ? clientX - startPosition : startPosition - clientX;
    const shift = (diff / this.startPosition.width) * 100;

    let percentage = '';

    if (shift <= 0) {
      percentage = '0%';
    } else if (shift >= 0 && shift <= end) {
      percentage = `${shift.toFixed(4)}%`;
    } else if (shift >= end) {
      percentage = `${end}%`;
    }

    this.subElements[this.activeSide].style[this.activeSide] = percentage;
    this.subElements.progress.style[this.activeSide] = percentage;

    const { from, to } = this.getValue();
    this.sorted = { from, to };

    if (activeSide === 'left') {
      this.subElements.from.innerHTML = this.formatValue(from);
    }
    if (activeSide === 'right') {
      this.subElements.to.innerHTML = this.formatValue(to);
    }
  };

  getValue() {
    const diff = this.max - this.min;
    const from = Math.round(this.min + 0.01 * parseFloat(this.subElements.left.style.left) * diff);
    const to = Math.round(this.max - 0.01 * parseFloat(this.subElements.right.style.right) * diff);
    return { from, to };
  }

  setShift(min, max, { from, to }) {
    const diff = max - min;
    const left = Math.floor(((from - min) / diff) * 100);
    const right = Math.floor(((max - to) / diff) * 100);
    this.shift = { left, right };
  }

  reset() {
    this.selected = { from: this.min, to: this.max };
    this.setShift(this.min, this.max, this.selected);
    this.activeSide = '';
    const { from, to, progress, left, right } = this.subElements;
    from.innerHTML = this.formatValue(this.selected.from);
    to.innerHTML = this.formatValue(this.selected.to);
    progress.style.right = '0';
    progress.style.left = '0';
    left.style.left = '0';
    right.style.right = '0';
  }

  render() {
    super.render();
    this.element.ondragstart = () => false;
    this.initListeners();
  }

  initListeners() {
    this.subElements.left.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.subElements.right.addEventListener('pointerdown', e => this.onPointerDown(e));
  }

  dispatch() {
    this.element.dispatchEvent(
      new CustomEvent(CUSTOM_EVENTS.SelectRange, {
        detail: {
          from: this.sorted.from,
          to: this.sorted.to
        }
      })
    );
  }
}
