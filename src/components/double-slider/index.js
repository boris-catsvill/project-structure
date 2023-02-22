export default class DoubleSlider {
  element = null;
  thumb = null;

  onPointerDown = (event) => {
    this.thumb = null;
    if (event.target.closest('.range-slider__thumb-left')) this.thumb = 'left';
    if (event.target.closest('.range-slider__thumb-right')) this.thumb = 'right';

    if (!this.thumb) return;

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp, { once: true });
  };

  onPointerMove = (event) => {
    const rect = this.slider.getBoundingClientRect();

    //только для тестов
    if (isFinite(rect.width))    {
      rect.width = 1000;
      rect.x = 0;
    }

    let position =
      ((event.clientX - rect.x) * (this.max - this.min)) / rect.width + this.min;

    position = Math.round(position);  
    position = position <= this.min ? this.min : position;
    position = position >= this.max ? this.max : position;

    if (this.thumb === 'left') {
      position = position > this.selected.to ? this.selected.to : position; 
      this.selected.from = position;
      this.thumbLeft.style.left = `${this.getProgressLeftPosition()}%`;
      this.progress.style.left = this.thumbLeft.style.left;
      this.elemFrom.textContent = `${this.formatValue(this.selected.from)}`;
    }

    if (this.thumb === 'right') {
      position = position < this.selected.from ? this.selected.from : position;
      this.selected.to = position;
      this.thumbRight.style.right = `${this.getProgressRightPosition()}%`;
      this.progress.style.right = this.thumbRight.style.right;
      this.elemTo.textContent = `${this.formatValue(this.selected.to)}`;
    }

  };

  onPointerUp = (event) => {
    
    document.removeEventListener('pointermove', this.onPointerMove);
    this.thumb = null;

    this.element.dispatchEvent(new CustomEvent("range-select", {
      detail: { 'from': this.selected.from, 'to': this.selected.to },
      bubbles: true
    }));
  };

  constructor({
    min = 0,
    max = 100,
    formatValue = (value) => value,
    selected = { 'from': min, 'to': max },
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;
    this.render();

    this.slider = this.element.querySelector('.range-slider__inner'); 
    this.thumbLeft = this.element.querySelector('.range-slider__thumb-left');
    this.thumbRight = this.element.querySelector('.range-slider__thumb-right');
    this.progress = this.element.querySelector('.range-slider__progress');
    this.elemFrom = this.element.querySelector('span[data-element="from"]');
    this.elemTo = this.element.querySelector('span[data-element="to"]');

    this.thumbLeft.ondragstart = () => false;
    this.thumbRight.ondragstart = () => false;

    this.thumbLeft.addEventListener('pointerdown', this.onPointerDown);
    this.thumbRight.addEventListener('pointerdown', this.onPointerDown);
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  getTemplate() {
    return `
        <div class="range-slider">
            <span data-element="from">${this.formatValue(this.selected.from)}</span>
            <div class="range-slider__inner">
                <span class="range-slider__progress" style="left: ${this.getProgressLeftPosition()}%; right: ${this.getProgressRightPosition()}%"></span>
                <span class="range-slider__thumb-left" style="left: ${this.getProgressLeftPosition()}%"></span>
                <span class="range-slider__thumb-right" style="right: ${this.getProgressRightPosition()}%"></span>
            </div>
            <span data-element="to">${this.formatValue(this.selected.to)}</span>
        </div>
        `;
  }

  getProgressLeftPosition() {
    return this.getProgressPosition(this.selected.from, this.min);
  }

  getProgressRightPosition() {
    return this.getProgressPosition(this.max, this.selected.to);
  }

  getProgressPosition(a, b) {
    return Math.round(((a - b) * 100) / (this.max - this.min));
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    //this.element = null;
  }
}
