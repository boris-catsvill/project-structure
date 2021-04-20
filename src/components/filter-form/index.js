import DoubleSlider from '../double-slider/index.js';

export default class FilterForm {

    constructor({
        sliderMin = 0,
        sliderMax = 100,
        sliderFormat
    } = {}) {
        this.sliderMin = sliderMin;
        this.sliderMax = sliderMax;
        this.sliderFormat = sliderFormat

        this.initComponents();
        this.render();
    }

    getTemplate() {
        return `
            <div class="content-box content-box_small">
              <form class="form-grid form-inline">
                <div class="form-group">
                  <label class="form-label">Сортировать по:</label>
                  <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
                </div>
                <div class="form-group">
                  <label class="form-label">Цена:</label>
                  <div data-element="doubleSlider"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Статус:</label>
                  <select class="form-control" data-element="filterStatus">
                    <option value="" selected="">Любой</option>
                    <option value="1">Активный</option>
                    <option value="0">Неактивный</option>
                  </select>
                </div>
              </form>
            </div>
    `;
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.getTemplate;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(element);

        this.subElements['doubleSlider'].append(this.components['doubleSlider'].element);

        this.initEventListeners();
    }

    getSubElements(element) {
        const result = {};
        const elements = element.querySelectorAll('[data-element]');

        for (const subElement of elements) {
            const name = subElement.dataset.element;

            result[name] = subElement;
        }

        return result;
    }

    initComponents() {
        const doubleSlider = new DoubleSlider({
            min: this.sliderMin,
            max: this.sliderMax,
            formatValue: this.sliderFormat,
        });

        this.components = { doubleSlider };
    }

    onFilterNameChange(event) {
        const { value } = event.target;

        this.element.dispatchEvent(new CustomEvent('change-name', {
            detail: value,
            bubbles: true
        }));
    }

    onFilterStatusChange(event) {
        const { value } = event.target;

        this.element.dispatchEvent(new CustomEvent('change-status', {
            detail: value,
            bubbles: true
        }));
    }

    onDoubleSliderChange(event) {
        this.element.dispatchEvent(new CustomEvent('range-select', {
            detail: event.detail,
            bubbles: true
        }));
    }

    initEventListeners() {
        const { filterName, filterStatus } = this.subElements;

        const { doubleSlider } = this.components;

        filterName.addEventListener('input', this.onFilterNameChange.bind(this));

        filterStatus.addEventListener('change', this.onFilterStatusChange.bind(this));

        doubleSlider.element.addEventListener('range-select', this.onDoubleSliderChange.bind(this));
    }

    remove() {
        this.element.remove();

        for (const component of Object.values(this.components)) {
			component.destroy();
		}
    }

    destroy() {
        this.remove();
    }
}