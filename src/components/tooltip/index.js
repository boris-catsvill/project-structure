class Tooltip {
    static instance;
    element;
    elements;

    handlePointerOver = event => {
        this.over(event);
    }

    handlePointerMove = event => {
        this.move(event);
    };

    constructor() {
        if (Tooltip.instance) {
            return Tooltip.instance;
        }

        Tooltip.instance = this;
    }

    initialize() {
        this.render();
        this.initEventListeners();
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div class="tooltip"></div>`;
        this.element = wrapper.firstElementChild;
        this.elements = new Map();
    }

    initEventListeners() {
        document.addEventListener('pointerover', this.handlePointerOver);
    }

    over(event) {
        const target = event.target;

        if (!target.dataset.tooltip) return;

        if (!this.elements.has(target)) {
            this.elements.set(target, target.dataset.tooltip);
        }

        this.element.innerHTML = this.elements.get(target);

        document.body.append(this.element);

        target.addEventListener('pointermove', this.handlePointerMove);

        target.addEventListener('pointerout', () => {
            this.element.remove();
            target.removeEventListener('pointermove', this.handlePointerMove);
        });
    }

    move(event) {
        const shift = 10;
        const clientY = event.clientY + shift;
        const clientX = event.clientX + shift;

        this.element.style.top = `${clientY}px`;
        this.element.style.left = `${clientX}px`;
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();

        this.element = null;
        this.elements = null;

        document.removeEventListener('pointerover', this.handlePointerOver);

        Tooltip.instance = null;
    }
}

const tooltip = new Tooltip();
export default tooltip;
