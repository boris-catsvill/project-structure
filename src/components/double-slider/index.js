export default class DoubleSlider {
    onMouseDown = (event) => {
        const thumbElem = event.target;

        event.preventDefault(); // предотвратить запуск выделения (действие браузера)

        this.dragging = thumbElem;

        this.element.classList.add('range-slider_dragging');

        document.addEventListener('pointermove', this.onMouseMove);
        document.addEventListener('pointerup', this.onMouseUp);
    }

    onMouseMove = (event) => {
        event.preventDefault();

        const innerWidth = this.subElements.inner.getBoundingClientRect().width;
        const innerLeft = this.subElements.inner.getBoundingClientRect().left;
        const innerRight = this.subElements.inner.getBoundingClientRect().right;

        if (this.dragging === this.subElements.thumbLeft) {
            let newLeftSliderPosition = event.clientX - innerLeft;
            let newLeftSliderPositionPercent = 100 * newLeftSliderPosition / innerWidth;

            if (newLeftSliderPositionPercent < 0) {
                newLeftSliderPositionPercent = 0;
            }

            const rightSliderPositionPrecent = parseFloat(this.subElements.thumbRight.style.right);

            if (newLeftSliderPositionPercent > 100 - rightSliderPositionPrecent) {
                newLeftSliderPositionPercent = 100 - rightSliderPositionPrecent;
            }

            this.subElements.progress.style.left = newLeftSliderPositionPercent + '%';
            this.subElements.thumbLeft.style.left = newLeftSliderPositionPercent + '%';
            this.subElements.from.innerHTML = this.formatValue(Math.round(this.min + (this.max - this.min) * newLeftSliderPositionPercent * 0.01));
        }

        if (this.dragging === this.subElements.thumbRight) {
            let newRightSliderPosition = innerRight - event.clientX;
            let newRightSliderPositionPercent = 100 * newRightSliderPosition / innerWidth;

            const leftSliderPositionPrecent = parseFloat(this.subElements.thumbLeft.style.left);

            if (newRightSliderPositionPercent < 0) {
                newRightSliderPositionPercent = 0;
            }

            if (newRightSliderPositionPercent > 100 - leftSliderPositionPrecent) {
                newRightSliderPositionPercent = 100 - leftSliderPositionPrecent;
            }

            this.subElements.progress.style.right = newRightSliderPositionPercent + '%';
            this.subElements.thumbRight.style.right = newRightSliderPositionPercent + '%';
            this.subElements.to.innerHTML = this.formatValue(Math.round(this.max - (this.max - this.min) * newRightSliderPositionPercent * 0.01));
        }

    }

    onMouseMoveRightSlider = (event) => {
        event.preventDefault();

        const innerWidth = this.subElements.inner.getBoundingClientRect().width;
        const innerRight = this.subElements.inner.getBoundingClientRect().right;

        let newRightSliderPosition = innerRight - event.clientX;
        let newRightSliderPositionPercent = 100 * newRightSliderPosition / innerWidth;

        const leftSliderPositionPrecent = parseFloat(this.subElements.thumbLeft.style.left);

        if (newRightSliderPositionPercent < 0) {
            newRightSliderPositionPercent = 0;
        }

        if (newRightSliderPositionPercent > 100 - leftSliderPositionPrecent) {
            newRightSliderPositionPercent = 100 - leftSliderPositionPrecent;
        }

        this.subElements.progress.style.right = newRightSliderPositionPercent + '%';
        this.subElements.thumbRight.style.right = newRightSliderPositionPercent + '%';
        this.subElements.to.innerHTML = this.formatValue(Math.round(this.max - (this.max - this.min) * newRightSliderPositionPercent * 0.01));
    }

    onMouseUp = (event) => {
        this.element.classList.remove('range-slider_dragging');

        document.removeEventListener('pointerup', this.onMouseUp);
        document.removeEventListener('pointermove', this.onMouseMove);

        this.element.dispatchEvent(new CustomEvent('range-select', {
            detail: this.getValue(),
            bubbles: true
        }));
    }

    constructor({
        min = 0,
        max = 100,
        formatValue = value => value,
        selected = {
            from: min,
            to: max,
        }
    } = {}) {
        this.min = min;
        this.max = max;
        this.formatValue = formatValue;
        this.selected = selected;

        this.render();
    }

    render() {
        const element = document.createElement("div");

        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;
        this.element.ondragstart = () => false;

        this.subElements = this.getSubElements();

        this.initializeEventListener();

        this.update();
    }

    getTemplate() {
        return `
            <div class="range-slider">
              <span data-element="from">${this.formatValue(this.selected.from)}</span>
              <div data-element="inner" class="range-slider__inner">
                <span data-element="progress" class="range-slider__progress"></span>
                <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                <span data-element="thumbRight" class="range-slider__thumb-right"></span>
              </div>
              <span data-element="to">${this.formatValue(this.selected.to)}</span>
            </div>
          `
    }

    getSubElements() {
        const result = {};
        const elements = this.element.querySelectorAll('[data-element]');

        for (const subElement of elements) {
            const name = subElement.dataset.element;

            result[name] = subElement;
        }

        return result;
    }

    initializeEventListener() {
        this.subElements.thumbLeft.addEventListener('pointerdown', this.onMouseDown);
        this.subElements.thumbRight.addEventListener('pointerdown', this.onMouseDown);
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        document.removeEventListener('pointerdown', this.onMouseDown);
        document.removeEventListener('pointerdown', this.onMouseDown);
        document.removeEventListener('pointermove', this.onMouseMove);
        document.removeEventListener('pointerup', this.onMouseUp);
    }

    getValue() {
        const rangeTotal = this.max - this.min;
        const { left } = this.subElements.thumbLeft.style;
        const { right } = this.subElements.thumbRight.style;

        const from = Math.round(this.min + parseFloat(left) * 0.01 * rangeTotal);
        const to = Math.round(this.max - parseFloat(right) * 0.01 * rangeTotal);

        return { from, to };
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
}