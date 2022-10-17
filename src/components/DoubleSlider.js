export default class DoubleSlider {

  constructor({
    min = 0,
    max = 100,
    formatValue = value => `${value}`,
    selected = {
      from: min,
      to: max,
    }
  } = {}) {
    this.formatValue = formatValue;
    this.min = min;
    this.max = max;
    this.range = this.max - this.min;
    this.selected = selected;

    this.progressData = {
      leftThumbShiftFromLeft: ((this.selected.from - min) / (this.range)) * 100,
      rightThumbShiftFromLeft: ((this.selected.to - min) / (this.range)) * 100,
      kindOfThumb: '',
    };

    this.render(); 
  }

  render() {
    const { leftThumbShiftFromLeft, rightThumbShiftFromLeft } = this.progressData;
    const { from, to } = this.selected;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = (
      `<div class="range-slider">
            <span data-element="from">${this.formatValue(from)}</span>
            <div class="range-slider__inner">
                <span data-element="progress" class="range-slider__progress" style="left: ${leftThumbShiftFromLeft}%; right: ${100 - rightThumbShiftFromLeft}%"></span>
                <span data-element="left-thumb" class="range-slider__thumb-left" style="left: ${leftThumbShiftFromLeft}%"></span>
                <span data-element="right-thumb" class="range-slider__thumb-right" style="left: ${rightThumbShiftFromLeft}%"></span>
            </div>
            <span data-element="to">${this.formatValue(to)}</span>
       </div>`
    );
    this.element = wrapper.firstElementChild;
    this.slider = this.element.querySelector('.range-slider__inner');
    this.subElements = this.getSubElements();
    this.slider.addEventListener('pointerdown', this.pointerDownHandler);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (let element of elements) {
      const name = element.dataset.element.match(/(left|right|progress|to|from)/)[0];
      result[name] = element;
    }
    return result;
  }

  updateElement(shiftFromLeft) {
    const { kindOfThumb } = this.progressData;
    const target = kindOfThumb === 'left' ? this.subElements.from : this.subElements.to;
    const thumb = this.subElements[kindOfThumb];
    const progress = this.subElements.progress;

    const shiftOfProgress = kindOfThumb === 'left' ? shiftFromLeft : 100 - shiftFromLeft;
    const kindOfSelected = kindOfThumb === 'left' ? 'from' : 'to';

    [progress.style[kindOfThumb], thumb.style.left] = [`${shiftOfProgress}%`, `${shiftFromLeft}%`];

    this.selected[kindOfSelected] = this.min + (this.range / 100 * shiftFromLeft);

    target.textContent = this.formatValue(this.selected[kindOfSelected]);
  }

  pointerMoveHandler = (event) => {

    const { clientX } = event;
    const { leftThumbShiftFromLeft, rightThumbShiftFromLeft, kindOfThumb } = this.progressData;
    const {widthOfSlider, leftShiftOfSlider} = this;

    const shiftFromLeft = Math.ceil((clientX - leftShiftOfSlider) / widthOfSlider * 100);

    if (kindOfThumb === 'left') {
      if (shiftFromLeft < 0 || shiftFromLeft > rightThumbShiftFromLeft) {return;}
      this.progressData.leftThumbShiftFromLeft = shiftFromLeft;
    }
    if (kindOfThumb === 'right') {
      if (shiftFromLeft > 100 || shiftFromLeft < leftThumbShiftFromLeft) {return;}
      this.progressData.rightThumbShiftFromLeft = shiftFromLeft;
    }

    this.updateElement(shiftFromLeft);
  }

  pointerUpHandler = () => {
    this.createEventRangeSelect();
    document.removeEventListener('pointerup', this.pointerUpHandler);
    document.removeEventListener('pointermove', this.pointerMoveHandler);
  }

  pointerDownHandler = (event) => {
    event.preventDefault();
    if (event.target === this.subElements.progress) { return; }

    this.progressData.kindOfThumb = event.target.dataset.element.match(/(left|right)/)[0];

    const widthOfSliderBorder = this.slider.clientLeft;
    this.widthOfSlider = this.slider.getBoundingClientRect().width - widthOfSliderBorder;
    this.leftShiftOfSlider = this.slider.getBoundingClientRect().left;

    document.addEventListener('pointermove', this.pointerMoveHandler);
    document.addEventListener('pointerup', this.pointerUpHandler);
  }

  createEventRangeSelect() {
    const event = new CustomEvent("range-select", {
      bubles: true,
      detail: this.selected
    });
    this.element.dispatchEvent(event);
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.element.removeEventListener('pointerdown', this.pointerDownHandler);
  }
}
