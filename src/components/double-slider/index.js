export default class DoubleSlider {
    element;
    subElements;

    constructor({
        min = 300,
        max = 800,
        formatValue = value => "$" + value,
        selected = {
            from: min,
            to: max
        },
    } = {}){

        this.min = min;
        this.max = max;
        this.selected = selected;
        this.formatValue = formatValue;

        this.render();
    }

    initialize(){
        const {thumbLeft, thumbRight} = this.subElements;

        thumbLeft.addEventListener("pointerdown", this.onMouseDown);

        thumbRight.addEventListener("pointerdown", this.onMouseDown);
    }

    get template(){
        return `<div class="range-slider">
                    <span data-element="from">${this.formatValue(this.selected.from)}</span>
                    <div data-element="inner" class="range-slider__inner">
                        <span data-element="progress" class="range-slider__progress"></span>
                        <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                        <span data-element="thumbRight" class="range-slider__thumb-right"></span>
                    </div>
                    <span data-element="to">${this.formatValue(this.selected.to)}</span>
                </div>`;
    }

    render(){
        const slider = document.createElement("div");

        slider.innerHTML = this.template;

        this.element = slider.firstElementChild;

        this.subElements = this.getSubElements();

        this.initialize();
        this.update();
    }

    getSubElements(element = this.element) {
        const elements = element.querySelectorAll("[data-element]");

        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;

          return accum;
        }, {});
    }

    update() {
        const range = this.max - this.min;
        const {from, to} = this.selected;
        const rangeLeft = Math.floor((from - this.min) / range * 100) + "%";
        const rengeRight = Math.floor((this.max - to) / range * 100) + "%";

        this.subElements.progress.style.left = rangeLeft;
        this.subElements.progress.style.right = rengeRight;

        this.subElements.thumbLeft.style.left = rangeLeft;
        this.subElements.thumbRight.style.right = rengeRight;
    }

    reset(start, end){
      this.subElements.progress.style.left = 0 + "%";
      this.subElements.progress.style.right = 0 + "%";

      this.subElements.thumbLeft.style.left = 0 + "%";
      this.subElements.thumbRight.style.right = 0 + "%";

      this.subElements.from.innerHTML = this.formatValue(start);
      this.subElements.to.innerHTML = this.formatValue(end)

    }

    onMouseDown = (event) => {
        event.preventDefault();

        const target = event.target;

        const { left, right } = target.getBoundingClientRect();

        if (target === this.subElements.thumbLeft) {
            this.shiftX = right - event.clientX;
        } else {
            this.shiftX = left - event.clientX;
        }

        this.dragging = target;

        this.element.classList.add("range-slider_dragging");

        document.addEventListener("pointermove", this.onMove);
        document.addEventListener("pointerup", this.onMouseUp);
    }

    onMouseUp = () => {
        this.element.classList.remove("range-slider_dragging");

        document.removeEventListener("pointermove", this.onMove);
        document.removeEventListener("pointerup", this.onMouseUp);

        this.element.dispatchEvent(new CustomEvent("range-select", {
          detail: this.getValue(),
          bubbles: true
        }));
    };

    onMove = event => {
        event.preventDefault();

        const { left: innerLeft, right: innerRight, width } = this.subElements.inner.getBoundingClientRect();

        if (this.dragging === this.subElements.thumbLeft) {
          let newLeft = (event.clientX - innerLeft + this.shiftX) / width;

          if (newLeft < 0) {
            newLeft = 0;
          }

          if (newLeft > 1) {
            newLeft = 1;
          }

          newLeft *= 100;

          const right = parseFloat(this.subElements.thumbRight.style.right);

          if (newLeft + right > 100) {
            newLeft = 100 - right;
          }

          this.dragging.style.left = this.subElements.progress.style.left = newLeft + "%";
          this.subElements.from.innerHTML = this.formatValue(this.getValue().from);
        }

        if (this.dragging === this.subElements.thumbRight) {
          let newRight = (innerRight - event.clientX - this.shiftX) / width;

          if (newRight < 0) {
            newRight = 0;
          }

          if (newRight > 1) {
            newRight = 1;
          }

          newRight *= 100;

          const left = parseFloat(this.subElements.thumbLeft.style.left);
          if (left + newRight > 100) {
            newRight = 100 - left;
          }
          this.dragging.style.right = this.subElements.progress.style.right = newRight + "%";
          this.subElements.to.innerHTML = this.formatValue(this.getValue().to);
        }
    };

    getValue() {
        const range = this.max - this.min;
        const { left } = this.subElements.thumbLeft.style;
        const { right } = this.subElements.thumbRight.style;

        const from = Math.round(this.min + parseFloat(left) * 0.01 * range);
        const to = Math.round(this.max - parseFloat(right) * 0.01 * range);

        return { from, to };
    }

    destroy(element = this.element){
        element.remove();
        document.removeEventListener("pointermove", this.onMove);
        document.removeEventListener("pointerup", this.onMouseUp);
        this.subElements = {};
    }
}