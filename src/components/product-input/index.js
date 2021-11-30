export default class ProductInput {
  element;
  subElements = {};
  thumbLeftPosition = 0;
  thumbRightPosition = 0;
  costFrom = 0;
  costTo = 4000;
  status;

  constructor() {
    this.render();
  }

  getTemplate = () => {
    return `
    <div class="content-box content-box_small">
        <form class="form-inline" data-elem="productInputs">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Цена:</label>
            <div class="range-slider">
              <span data-elem="from">$0</span>
              <div data-elem="inner" class="range-slider__inner">
                <span data-elem="progress" class="range-slider__progress" style="left: 0%; right: 0%;"></span>
                <span data-elem="thumbLeft" class="range-slider__thumb-left" style="left: 0%;"></span>
                <span data-elem="thumbRight" class="range-slider__thumb-right" style="right: 0%;"></span>
              </div>
              <span data-elem="to">$4000</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
      </div>
    `
  }

  getSubElements(element) {
    const elements = {};

    const subElements = element.querySelectorAll('[data-elem]');

    for (const subElement of subElements) {
      elements[subElement.dataset.elem] = subElement;
    }

    return elements;
  }

  dispatchEvent () {
    this.element.dispatchEvent(new CustomEvent('date-search', {
      bubbles: true,
      detail:  {
        price_gte: this.costFrom,
        price_lte: this.costTo,
        title_like: this.subElements.filterName.value,
        status: this.status,
      }
    }));
  }

  onPointerDownThumbLeft = () => {
    const onPointerMove = (e) => {
      let finishPosition = Math.round((e.clientX - this.subElements.inner.getBoundingClientRect().left) / this.subElements.inner.offsetWidth * 100);
      if (finishPosition < 0) finishPosition = 0;
      if (finishPosition > (100 - this.thumbRightPosition)) finishPosition = 100 - this.thumbRightPosition;
      this.subElements.thumbLeft.style.left = finishPosition + '%';
      this.subElements.progress.style.left = finishPosition + '%';
      this.thumbLeftPosition = finishPosition;
      this.costFrom = finishPosition / 100 * 4000;
      this.subElements.from.innerHTML = '$' + this.costFrom;
    }
    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      this.dispatchEvent();
    }
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  onPointerDownThumbRight = () => {
    const onPointerMove = (e) => {
      let finishPosition = Math.round((this.subElements.inner.getBoundingClientRect().right - e.clientX) / this.subElements.inner.offsetWidth * 100);
      if (finishPosition < 0) finishPosition = 0;
      if (finishPosition > (100 - this.thumbLeftPosition)) finishPosition = 100 - this.thumbLeftPosition;
      this.subElements.thumbRight.style.right = finishPosition + '%';
      this.subElements.progress.style.right = finishPosition + '%';
      this.thumbRightPosition = finishPosition;
      this.costTo = (100 - finishPosition) / 100 * 4000;
      this.subElements.to.innerHTML = '$' + this.costTo;
    }
    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      this.dispatchEvent();
    }
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  onStatusChange = (e) => {
    this.status = e.target.value || 3;
    this.dispatchEvent();
  }

  onInputChange = () => {
    this.dispatchEvent();
  };

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.subElements.thumbLeft.addEventListener('pointerdown', this.onPointerDownThumbLeft);
    this.subElements.thumbRight.addEventListener('pointerdown', this.onPointerDownThumbRight);
    this.subElements.filterStatus.addEventListener('change', this.onStatusChange);
    this.subElements.filterName.addEventListener('input', this.onInputChange)
    this.subElements.productInputs.addEventListener('submit', (e) => {
      e.preventDefault();
      this.dispatchEvent();
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
