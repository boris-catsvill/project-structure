export default class DoubleSlider {
    constructor({
        min,
        max,
        formatValue,
        selected: {
            from,
            to
        } = {} } = {}) {

        this.step = 1;

        this.min = min;
        this.max = max;

        this.fromValue = min;
        this.toValue = max;

        this.formatValue = formatValue;

        this.from = from ? from : min;
        this.to = to ? to : max;

        this.render();
        this.initEventListner();
    }

    getPositionFromValue(value) {
        const percentage = (value - this.min) / (this.max - this.min) * 100;

        return (!Number.isNaN(percentage)) ? percentage : 0;
    };

    getValueFromPosition(pos) {
        const percentage = ((pos) / (this.maxHandlePos || 1));
        const value = this.step * Math.round(percentage * (this.max - this.min) / this.step) + this.min;

        return Number((value).toFixed());
    };

    getCoords(elem) {
        return elem.getBoundingClientRect();
    }

    updateRange(event) {
        const sliderPosition = this.getCoords(this.element.querySelector('.range-slider__inner'));
        const leftThumb = this.element.querySelector('.range-slider__thumb-left');
        const rightThumb = this.element.querySelector('.range-slider__thumb-right');
        const progress = this.element.querySelector('.range-slider__progress');

        let value, position, positionX = event.clientX;

        positionX = positionX > sliderPosition.width + sliderPosition.left ? sliderPosition.width + sliderPosition.left : positionX;
        positionX = positionX < sliderPosition.left ? sliderPosition.left : positionX;

        this.maxHandlePos = sliderPosition.width;

        value = this.getValueFromPosition(positionX - sliderPosition.left);
        position = this.getPositionFromValue(value);

        if (this.currentTarget.className.includes('left')) {
            this.fromPosition = position;
            if (this.fromPosition + this.toPosition <= 100) {
                progress.style.left = position + "%";
                leftThumb.style.left = position + "%";
                this.fromValue = value;
                this.element.firstElementChild.innerHTML = this.formatValue(value);
            }

        } else {
            this.toPosition = (100 - position);
            if (this.fromPosition + this.toPosition <= 100) {
                progress.style.right = (100 - position) + "%";
                rightThumb.style.right = (100 - position) + "%";
                this.toValue = value;
                this.element.lastElementChild.innerHTML = this.formatValue(value);
            }
        }
    }

    getDoubleSlider() {
        const { formatValue, from, to } = this;

        this.fromPosition = this.getPositionFromValue(from);
        this.toPosition = this.getPositionFromValue(to);

        return `
            <div class="range-slider">
                <span data-element="from">${formatValue ? formatValue(from) : from}</span>
                <div class="range-slider__inner">
                    <span class="range-slider__progress" style="left: ${this.fromPosition}%; right: ${this.toPosition}%"></span>
                    <span class="range-slider__thumb-left" style="left: ${this.fromPosition}%"></span>
                    <span class="range-slider__thumb-right" style="right: ${this.toPosition}%"></span>
                </div>
                <span data-element="to">${formatValue ? formatValue(to) : to}</span>
            </div>
        `;
    }

    render() {
        const wrapper = document.createElement('div');

        wrapper.innerHTML = this.getDoubleSlider();

        const element = wrapper.firstElementChild;

        this.element = element;
    }

    initEventListner() {
        const thumbs = this.element.querySelectorAll('[class*="thumb"]');

        const moveListener = (event) => {
            this.updateRange(event);
        }

        document.addEventListener('range-select', (event) => {
        });

        thumbs.forEach((thumb) => {
            thumb.addEventListener('pointerdown', (event) => {
                this.currentTarget = event.target;

                document.addEventListener('pointermove', moveListener);
            });

            thumb.addEventListener('pointerup', (event) => {
                document.removeEventListener('pointermove', moveListener);

                this.element.dispatchEvent(new CustomEvent("range-select", { bubbles: true, detail: { from: this.fromValue, to: this.toValue } }));
            });
        });
    }

    destroy() {
        this.element.remove();
    }
}
