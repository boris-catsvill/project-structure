import Component from "../../utils/component";
import DoubleSlider from "../double-slider";

export default class ProductsFilters extends Component {
  doubleSlider = null;

  render() {
    this.element = this.createElement(this.template);
    this.setChildren();
    this.addDoubleSliderComponent();
    return this.element;
  }

  addDoubleSliderComponent() {
    this.doubleSlider = new DoubleSlider({ min: 0, max: 4000 });

    const sliderSlot = this.getChildElementByName('sliderContainer');
    sliderSlot.append(this.doubleSlider.element);
  }

  initEventListeners() {
    this.element.addEventListener('submit', evt => {
      evt.preventDefault();
    })

    const { filterName, filterStatus } = this.subElements; 
    filterName.addEventListener('input', this.handleChangeInputValue);
    filterStatus.addEventListener('change', this.handleChangeStatus);
  }

  handleChangeInputValue = () => {
    const value = this.subElements.filterName.value;
    this.emitEvent('change-input-filter', { value }, true);
  }

  handleChangeStatus = () => {
    const value = this.subElements.filterStatus.value;
    this.emitEvent('change-status-filter', { status: value }, true);
  }

  get template() {
    return (
      `<form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>

          <div class="form-group form-group--slider">
            <label class="form-label form-label--slider">Цены:</label>
            <div class="form--slider" data-element="sliderContainer"></div>
          </div>

          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>`
    )
  }

  destroy() {
    super.destroy();
    this.doubleSlider = null;
  }
}