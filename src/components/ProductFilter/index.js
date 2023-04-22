import DoubleSlider from '../double-slider/index.js';

export default class ProductFilter {
  element;
  subElements = {
    sliderContainer: null,
    filterStatus: null,
    filterName: null
  };
  components = {};

  constructor({
              min = 100,
              max = 4000,
              formatValue = value => `$${value}`} = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.formElement = null;
    this.url = null;
    this.initDoubleSlider();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-elem]');
    [...elements].map(element => {
      result[element.dataset.elem] = element;
    });
    return result;
  }

  getTemplate() {
    return `
      <form class='form-inline'>
        <div class='form-group'>
          <label class='form-label'>Сортировать по:</label>
          <input type='text' data-elem='filterName' class='form-control' placeholder='Название товара'>
        </div>
        <div class='form-group' data-elem='sliderContainer'>
        <label class='form-label'>Цена:</label>
        </div>
        <div class='form-group'>
        <label class='form-label'>Статус:</label>
        <select class='form-control' data-elem='filterStatus'>
          <option value='' selected=''>Любой</option>
          <option value='1'>Активный</option>
          <option value='0'>Неактивный</option>
        </select>
        </div>
      </form>
    `;
  }

  initEventListener() {
    this.element.addEventListener('input', this.handleFormChange);
    this.element.addEventListener('range-select', this.handleFormChange);
  }

  initDoubleSlider() {

    const doubleSlider = new DoubleSlider({
      min: this.min,
      max: this.max,
      formatValue: this.formatValue
    });
    this.components.doubleSlider = doubleSlider;
  }

  handleFormChange = (event) => {
    if (event.detail){
      const { from, to } = event.detail;
      this.min = from;
      this.max = to;
    }
    this.url = this.buildUrl();
    document.dispatchEvent(new CustomEvent('product-filter', {
      detail: {
        params: this.url
      }
    }));
  }

  buildUrl = () => {
    const filterName = this.subElements.filterName.value;
    const filterStatus = this.subElements.filterStatus.value;
    const params = {
      _embed: 'subcategory.category',
      title_like: filterName,
      status: filterStatus,
      price_gte: this.min,
      price_lte: this.max,
      _sort: 'title',
      _order: 'asc',
      _start: 0,
      _end: 30
    };

    return params;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.sliderContainer.append(this.components.doubleSlider.element);
    this.initEventListener();
    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;

    // window.removeEventListener('scroll', this.onWindowScroll);
  }
}

