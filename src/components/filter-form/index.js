const SORT_LABEL = 'Сортировать по:';
const PRODUCT_LABEL = 'Название товара';
const PRICE_LABEL = 'Цена:';
const FROM_LABEL = '$0';
const TO_LABEL = '$4000';
const STATUS_LABEL = 'Статус:';
const STATUS_ANY_LABEL = 'Любой';
const STATUS_ACTIVE_LABEL = 'Активный';
const STATUS_INACTIVE_LABEL = 'Неактивный';

export default class FilterForm {
  element;

  constructor() {
    this.render();
  }

  getTemplate = () => {
    return `
        <form class='form-inline'>
          <div class='form-group'>
            <label class='form-label'>${SORT_LABEL}</label>
            <input type='text' data-elem='filterName' class='form-control' placeholder='${PRODUCT_LABEL}'>
          </div>
          <div class='form-group' data-elem='sliderContainer'>
            <label class='form-label'>${PRICE_LABEL}</label>
          <div class='range-slider'>
      <span data-elem='from'>${FROM_LABEL}</span>
      <div data-elem='inner' class='range-slider__inner'>
        <span data-elem='progress' class='range-slider__progress' style='left: 0%; right: 0%;'></span>
        <span data-elem='thumbLeft' class='range-slider__thumb-left' style='left: 0%;'></span>
        <span data-elem='thumbRight' class='range-slider__thumb-right' style='right: 0%;'></span>
      </div>
      <span data-elem='to'>${TO_LABEL}</span>
    </div>
    </div>
          <div class='form-group'>
            <label class='form-label'>${STATUS_LABEL}</label>
            <select class='form-control' data-elem='filterStatus'>
              <option value='' selected=''>${STATUS_ANY_LABEL}</option>
              <option value='1'>${STATUS_ACTIVE_LABEL}</option>
              <option value='0'>${STATUS_INACTIVE_LABEL}</option>
            </select>
          </div>
        </form>
  `;
  };

  render = () => {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    return this.element;
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    this.subElements = {};
  };
}
