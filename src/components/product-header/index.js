import DoubleSlider from '../double-slider';

export default class ProductHeader {
  element;
  subElements = {};
  components = {};

  constructor({
    min = 100,
    max = 200,
    formatValue = value => '$' + value,
    selected = {
      from: min,
      to: max
    },
    setFindString = () => {}
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;
    this.setFindString = setFindString;

    this.render();
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  initComponents() {
    const sliderContainer = new DoubleSlider({
      min: this.min,
      max: this.max,
      formatValue: this.formatValue,
      selected: this.selected
    });

    this.components = {
      sliderContainer
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  get template() {
    return `
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="sliderContainer">
            <label class="form-label">Цена:</label>

            <!-- sliderContainer -->

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
		`;
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    this.element = null;
    this.subElements = {};
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}
