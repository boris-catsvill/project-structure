export default class DoubleSlider {
  element;
  subElements = {};

  constructor(maxPrice) {
    this.maxPrice = maxPrice;
    this.render();
    this.getSubElements();
    this.getValues();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('div');
    element.classList.add('range-slider');
    element.innerHTML = this.template;
    this.element = element;
  }

  getValues() {
    this.valueStart = parseInt(this.subElements.startValue.textContent.replace('$', ''));
    this.valueEnd = parseInt(this.subElements.endValue.textContent.replace('$', ''));
    this.resultStart = this.valueStart;
    this.resultEnd = this.valueEnd;
  }

  clearSlider() {
    this.subElements.startValue.innerHTML = `$0`;
    this.subElements.thumbLeft.style.left = '0%';
    this.subElements.progress.style.left = `0%`;

    this.subElements.endValue.innerHTML = `$${this.maxPrice}`;
    this.subElements.thumbRight.style.right = '0%';
    this.subElements.progress.style.right = `0%`;
  }

  mouseDownHandler = event => {
    const target = event.target.closest('span');
    if (!target) return;
    this.target = target;

    this.width = this.subElements.progress.parentNode.clientWidth;
    this.shift = this.subElements.progress.parentNode.getBoundingClientRect().left;

    document.addEventListener('mousemove', this.mouseMoveHandler);
    this.element.addEventListener('mouseup', this.mouseUpHandler);
  };

  mouseMoveHandler = event => {
    if (this.target.classList.contains('range-slider__thumb-left')) {
      let percent = Math.floor(100 / (this.width / (event.clientX - this.shift)));
      percent = percent > 100 ? 100 : percent < 0 ? 0 : percent;

      this.target.style.left = `${percent}%`;
      this.subElements.progress.style.left = `${percent}%`;

      this.resultStart = Math.floor(
        this.valueStart + ((this.valueEnd - this.valueStart) / 100) * percent
      );
      this.subElements.startValue.innerHTML = `$${this.resultStart}`;
    }
    if (this.target.classList.contains('range-slider__thumb-right')) {
      let percent = Math.floor(
        (100 / (this.width / (event.clientX - this.width - this.shift))) * -1
      );
      percent = percent > 100 ? 100 : percent < 0 ? 0 : percent;

      this.target.style.right = `${percent}%`;
      this.subElements.progress.style.right = `${percent}%`;

      this.resultEnd = Math.floor(
        this.valueEnd - ((this.valueEnd - this.valueStart) / 100) * percent
      );
      this.subElements.endValue.innerHTML = `$${this.resultEnd}`;
    }
  };

  mouseUpHandler = event => {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.dispatchEvent(new CustomEvent('range-select'));
  };

  initEventListeners() {
    this.element.addEventListener('mousedown', this.mouseDownHandler);
  }

  getSubElements() {
    const elementsArr = this.element.querySelectorAll('[data-element]');

    elementsArr.forEach(element => {
      this.subElements[element.dataset.element] = element;
    });
  }

  get template() {
    return `
      <span data-element="startValue">$0</span>
      <div class="range-slider__inner">
        <span class="range-slider__progress" data-element="progress"></span>
        <span class="range-slider__thumb-left" data-element="thumbLeft"></span>
        <span class="range-slider__thumb-right" data-element="thumbRight"></span>
      </div>
      <span data-element="endValue">$${this.maxPrice}</span>
    `;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
  }
}
