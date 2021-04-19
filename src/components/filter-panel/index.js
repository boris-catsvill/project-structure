import DoubleSlider from '../double-slider/index.js';

export default class FilterPanel {
  subElements = {};
  components = {};

  constructor({
    sliderMin = 0,
    sliderMax = 4000
  } = {}) {
    this.sliderMin = sliderMin;
    this.sliderMax = sliderMax;

    this.render();
  }

  get getTemplate() {
    return `
      <div class="content-box content-box_small">
        <form class="form-grid form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="sliderContainer">
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
    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();

    this.addEventListeners();
  }

  getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]');

    return [...subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  initComponents() {
    const doubleSlider = new DoubleSlider({
      min: this.sliderMin,
      max: this.sliderMax
    });

    this.components = {doubleSlider};
  }

  renderComponents() {
    Object.entries(this.components).forEach(([title, component]) => {
      const container = this.subElements[title];

      container.append(component.element);
    });
  }

  addEventListeners() {
    const {
      filterName,
      filterStatus
    } = this.subElements;

    const { doubleSlider } = this.components;

    filterName.addEventListener('input', () => {
      const { value } = filterName;

      this.element.dispatchEvent(new CustomEvent('change-name', {
        detail: value,
        bubbles: true
      }));
    });

    filterStatus.addEventListener('change', event => {
      const { value } = event.target;

      this.element.dispatchEvent(new CustomEvent('change-status', {
        detail: value,
        bubbles: true
      }));
    });

    doubleSlider.element.addEventListener('range-select', ({ detail }) => {
      this.element.dispatchEvent(new CustomEvent('range-select', {
        detail,
        bubbles: true
      }));
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}