import DoubleSlider from "../double-slider";

export default class InlineForm {
  element;
  subElements = {};
  url;

  onSubmit = async (event) => {
    event.preventDefault();

    return false;
  }

  onFilterNameChange = async (event) => {
    event.preventDefault();
    this.filterName = event.target.value;
    this.filterEvent.detail.filterName = this.filterName;
    this.element.dispatchEvent(this.filterEvent);
  }

  onRangeSelect = async (event) => {
    event.preventDefault();

    this.priceSelect = event.detail;
    this.filterEvent.detail.priceSelect = this.priceSelect;
    this.element.dispatchEvent(this.filterEvent);
  }

  onFilterStatusSelect = async (event) => {
    event.preventDefault();

    this.filterStatus = event.target.value;
    this.filterEvent.detail.filterStatus = this.filterStatus;
    this.element.dispatchEvent(this.filterEvent);
  }

  constructor({filterName = '', rangeConfig = {}, filterStatus = ''}) {
    this.filterName = filterName;
    this.doubleSlider = new DoubleSlider(rangeConfig);
    this.priceSelect = this.doubleSlider.selected;
    this.filterStatus = filterStatus;
    this.filterEvent = new CustomEvent('filter-select',
      {
        bubbles: true,
        detail: {
          filterName: this.filterName,
          priceSelect: this.doubleSlider.selected,
          filterStatus: this.filterStatus,
        }
      });
    this.render();
  }

  get template() {
    return `<form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text"
            data-elem="filterName"
            class="form-control"
            placeholder="Название товара" value="${this.filterName}">
          </div>
          <div class="form-group" data-elem="sliderContainer"><label class="form-label">Цена:</label></div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" ${this.filterStatus === '' ? 'selected=""' : ''}>Любой</option>
              <option value="1" ${this.filterStatus === '1' ? 'selected=""' : ''}>Активный</option>
              <option value="0" ${this.filterStatus === '0' ? 'selected=""' : ''}>Неактивный</option>
            </select>
          </div>
        </form>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.subElements.sliderContainer.append(this.doubleSlider.element);

    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-elem]');

    for (const subElement of elements) {
      const name = subElement.dataset.elem;

      result[name] = subElement;
    }

    return result;
  }

  initEventListeners() {
    this.subElements.filterName.addEventListener('change', this.onFilterNameChange);
    this.subElements.sliderContainer.addEventListener('range-select', this.onRangeSelect);
    this.subElements.filterStatus.addEventListener('change', this.onFilterStatusSelect);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
