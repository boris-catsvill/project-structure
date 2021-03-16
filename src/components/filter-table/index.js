import DoubleSlider from "../../components/double-slider/index.js";

export default class FilterTable {
element;
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

  get template () {
    return `
        <div class="content-box content-box_small">
          <form class="form-grid form-inline">
            <div class="form-group">
              <label class="form-label">Sort by:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Item title">
            </div>
          <div class="form-group" data-element="doubleSlider">
          </div>
          <div class="form-group">
            <label class="form-label">Status:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="" selected="">Any</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </form>
      </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    this.renderComponents();
    return this.element;
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  initComponents () {
    const doubleSlider = new DoubleSlider({
      min: this.sliderMin,
      max: this.sliderMax, 
    });

    this.components = {doubleSlider};
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
  
      root.append(element);
    });
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
}
}