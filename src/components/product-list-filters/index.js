import DoubleSlider from '../double-slider';

export default class ProductListFilters {
  subElements = {};
  components = {};
  values = {};
  priceMin = 0;
  priceMax = 4000;

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.components = this.initComponents();
    this.renderComponents();
    this.values = this.initValues();
    this.initEventListeners();

    return this.element;
  }

  get template() {
    return `
    <form class="form-inline">
      <div class="form-group">
        <label class="form-label">Поиск по:</label>
        <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
      </div>
      <div class="form-group" data-element="doubleSlider">
        <label class="form-label">Цена:</label>
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

  initComponents() {
    const doubleSlider = new DoubleSlider({
      min: this.priceMin,
      max: this.priceMax,
      formatValue: value => `$${value}`
    });

    return {
      doubleSlider
    };
  }

  renderComponents() {
    for (const componentName of Object.keys(this.components)) {
      const root = this.subElements[componentName];
      const element = this.components[componentName].element;

      root.append(element);
    }
  }

  initValues() {
    return {
      filterName: '',
      filterStatus: '',
      doubleSlider: {
        from: this.priceMin,
        to: this.priceMax
      }
    };
  }

  resetValues() {
    this.values = this.initValues();

    return this.values;
  }

  initEventListeners() {
    this.subElements.filterName.addEventListener('input', event => {
      const { value } = event.target;

      this.values.filterName = value;
      this.dispatchEvent();
    });

    this.components.doubleSlider.element.addEventListener('range-select', event => {
      const { from, to } = event.detail;

      this.values.doubleSlider = { from, to };
      this.dispatchEvent();
    });

    this.subElements.filterStatus.addEventListener('change', event => {
      const { value } = event.target;

      this.values.filterStatus = value;
      this.dispatchEvent();
    });
  }

  dispatchEvent() {
    this.element.dispatchEvent(
      new CustomEvent('product-list-change', {
        detail: this.values
      })
    );
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
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
    this.components = {};
    this.values = {};
  }
}
