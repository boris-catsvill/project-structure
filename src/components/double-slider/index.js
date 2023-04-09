export default class DoubleSlider {
    element;
    subElements;

    handleMoveFrom = event => {
        this.moveFrom(event);
    };

    handleMoveTo = event => {
        this.moveTo(event);
    };

    handleUp = () => {
        this.up();
    };

    constructor({ min = 0, max = 0, formatValue = value => value, selected } = {}) {
        this.min = min;
        this.max = max;
        this.formatValue = formatValue;
        this.selected = selected || { from: min, to: max };

        this.render();
        this.initEventListeners();
    }

    get template() {
        return `
            <div class="range-slider">
                <span data-element="from">${this.formatValue(this.min)}</span>
                <div data-element="inner" class="range-slider__inner">
                    <span data-element="progress" class="range-slider__progress"></span>
                    <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                    <span data-element="thumbRight" class="range-slider__thumb-right"></span>
                </div>
                <span data-element="to">${this.formatValue(this.max)}</span>
            </div>
        `;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.template;
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();

        this.leftThumbUpdate();
        this.rightThumbUpdate();
    }

    getSubElements() {
        const subElements = {};

        for (const elem of this.element.querySelectorAll('[data-element]')) {
            const name = elem.dataset.element;
            subElements[name] = elem;
        }

        return subElements;
    }

    initEventListeners() {
        const { thumbLeft, thumbRight } = this.subElements;

        thumbLeft.addEventListener('pointerdown', () => {
            document.addEventListener('pointermove', this.handleMoveFrom);
            document.addEventListener('pointerup', this.handleUp);
        });

        thumbRight.addEventListener('pointerdown', () => {
            document.addEventListener('pointermove', this.handleMoveTo);
            document.addEventListener('pointerup', this.handleUp);
        });
    }

    getMoveCalculationData(event) {
        const { right, left, width } = this.subElements.inner.getBoundingClientRect();
        const { clientX } = event;
        const range = this.max - this.min;

        return { clientX, right, left, width, range };
    }

    up() {
        this.element.dispatchEvent(new CustomEvent('range-select', {
            bubbles: true,
            detail: this.selected
        }));

        document.removeEventListener('pointermove', this.handleMoveFrom);
        document.removeEventListener('pointermove', this.handleMoveTo);
        document.removeEventListener('pointerup', this.handleUp)
    }

    moveFrom(event) {
        const { clientX, left, width, range } = this.getMoveCalculationData(event);

        const percent = (clientX - left) / width;
        const result = this.min + percent * range;

        if (result >= this.selected.to) {
            this.selected.from = this.selected.to;
        } else if (result <= this.min) {
            this.selected.from = this.min;
        } else {
            this.selected.from = Math.round(result);
        }

        this.leftThumbUpdate();
    }

    moveTo(event) {
        const { clientX, right, width, range } = this.getMoveCalculationData(event);

        const percent = (right - clientX) / width;
        const result = this.max - percent * range;

        if (result <= this.selected.from) {
            this.selected.to = this.selected.from;
        } else if (result >= this.max) {
            this.selected.to = this.max;
        } else {
            this.selected.to = Math.round(result);
        }

        this.rightThumbUpdate();
    }

    leftThumbUpdate() {
        const { from, progress, thumbLeft } = this.subElements;
        const percent = 1 - ((this.max - this.selected.from) / (this.max - this.min));

        from.innerHTML = this.formatValue(this.selected.from);

        if (this.selected.from >= this.selected.to) {
            progress.style.left = `${100 - parseFloat(progress.style.right)}%`;
            thumbLeft.style.left = `${100 - parseFloat(progress.style.right)}%`;

        } else if (this.selected.from <= this.min) {
            progress.style.left = `0%`;
            thumbLeft.style.left = `0%`;

        } else {
            progress.style.left = `${percent * 100}%`;
            thumbLeft.style.left = `${percent * 100}%`;
        }
    }

    rightThumbUpdate() {
        const { to, progress, thumbRight } = this.subElements;
        const percent = ((this.max - this.selected.to) / (this.max - this.min));

        to.innerHTML = this.formatValue(this.selected.to);

        if (this.selected.to <= this.selected.from) {
            progress.style.right = `${100 - parseFloat(progress.style.left)}%`;
            thumbRight.style.right = `${100 - parseFloat(progress.style.left)}%`;

        } else if (this.selected.to >= this.max) {
            progress.style.right = `0%`;
            thumbRight.style.right = `0%`;

        } else {
            progress.style.right = `${percent * 100}%`;
            thumbRight.style.right = `${percent * 100}%`;
        }
    }

    reset() {
        this.selected = { from: this.min, to: this.max };
        this.leftThumbUpdate();
        this.rightThumbUpdate();
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = null;

        document.removeEventListener('pointerup', this.handleUp);
        document.removeEventListener('pointermove', this.handleMoveFrom);
        document.removeEventListener('pointermove', this.handleMoveTo);
    }
}
