import DoubleSlider from '../double-slider/index.js';

export default class ProductFilter {
  element;
  subElements = {};
  slider;

  constructor() {
    this.render();
  }

  onChange = () => {
    this.element.dispatchEvent(
      new CustomEvent('filter', {
        detail: this.getFilterSettings(),
        bubbles: true
      })
    );
  };

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.renderSlider();
    this.initListeners();

    return this.element;
  }

  renderSlider() {
    this.slider = new DoubleSlider({ min: 0, max: 4000, formatValue: value => `$${value}` });
    this.subElements.sliderContainer.append(this.slider.element);
  }

  initListeners() {
    this.element.addEventListener('change', this.onChange);
    this.element.addEventListener('range-select', this.onChange);
  }

  getFilterSettings() {
    const settings = { price: this.slider.getValue() };
    const fields = ['title', 'status'];
    for (const field of fields) {
      const value = this.element[field].value;
      if (value.length) {
        settings[field] = value;
      }
    }
    return settings;
  }

  get template() {
    return `
        <form class="form-inline">
        <div class="form-group">
            <label class="form-label">Search:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Product title" name="title"/>
        </div>
        <div class="form-group" data-element="sliderContainer">
            <label class="form-label">Price:</label>
        </div>
        <div class="form-group">
            <label class="form-label">Status:</label>
            <select class="form-control" data-element="filterStatus" name="status">
            <option value="" selected="">Any</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
            </select>
        </div>
        </form>`;
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

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.slider.destroy();
  }
}
