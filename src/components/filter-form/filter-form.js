import DoubleSlider from '../double-slider/index.js';

export default class FilterForm {
  valueElements = {};

  constructor() {
    this.render();
  }

  getTemplate() {
    const div = document.createElement('div');

    div.innerHTML = `
    <form class="form-inline">
    </form>`;

    this.element = div.firstElementChild;
  }

  makeSearchInput() {
    const element = this.makeFormGroupDiv();

    element.innerHTML = `
    <label class="form-label">Sort by</label>
    <input type"text" data-element="filterName" class="form-control" placeholder="Product name">`;

    const input = element.querySelector('input');
    this.valueElements.input = input;

    this.element.append(element);
  }

  makeStatusInput() {
    const element = this.makeFormGroupDiv();

    element.innerHTML = `
    <label class="form-label">Status</label>
    <select data-element="filterStatus" class="form-control">
      <option value selected>Any</option>
      <option value="1">Active</option>
      <option value="0">Inactive</option>
    </select>`;

    const select = element.querySelector('select');
    this.valueElements.select = select;

    this.element.append(element);
  }

  makeSlider() {
    this.valueElements.doubleSlider = new DoubleSlider({ min: 0, max: 10000 });

    const element = this.makeFormGroupDiv();

    element.setAttribute('data-element', 'sliderContainer');
    element.innerHTML = `<label class="form-label">Price</label>`;
    element.append(this.valueElements.doubleSlider.element);

    this.element.append(element);
  }

  makeFormGroupDiv() {
    const div = document.createElement('div');

    div.classList.add('form-group');

    return div;
  }

  render() {
    this.getTemplate();
    this.makeSearchInput();
    this.makeSlider();
    this.makeStatusInput();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.valueElements.doubleSlider.destroy();
    this.valueElements = null;
    this.element = null;
  }
}
