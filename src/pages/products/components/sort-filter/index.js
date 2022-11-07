import DoubleSlider from './../../../../components/double-slider/index.js'

export default class SortFilter {
  components = {};
  sortParam = {};
  abortController = new AbortController();

  constructor(
    {
      filterName = "",
      price = {
        min: 0,
        max: 4000
      },
      status: statusList = [
        {value: "", name: "Любой"},
        {value: "1", name: "Активный"},
        {value: "2", name: "Неактивный"}
      ]
    } = {}
  ) {
    this.filterName = filterName;
    this.price = price;
    this.statusList = statusList;
    this.element = this.render();
  }


  render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();

    this.createComponents();
    this.renderComponents();
    this.addEventListeners();
    return this.element;
  }

  getTemplate() {
    return `
      <form class="form-inline">
          <div class="form-group">
              <label class="form-label">Сортировать по:</label>
              <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара" value=${this.filterName}>
          </div>
          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Цена:</label>
          </div>
          <div class="form-group">
              <label class="form-label">Статус:</label>
              <select class="form-control" data-elem="filterStatus">
                   ${this.makeStatusListHtml()}
              </select>
          </div>
      </form>
    `;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    this.abortController.abort();
    Object.values(this.components).forEach(component => component.destroy());
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-elem]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;
      return accum;
    }, {});
  }

  makeStatusListHtml() {
    return this.statusList.map(status => {
      const selected = status.value === '' ? 'selected = ""' : '';
      return `<option value="${status.value}" ${selected}>${status.name}</option>`
    }).join('');
  }

  createComponents() {
    const sliderContainer = new DoubleSlider(this.price);
    this.components = {sliderContainer};
  }

  renderComponents() {
    Object.entries(this.components).forEach(([name, component]) => {
      const subElement = this.subElements[name];
      if (!subElement) {
        return;
      }
      subElement.append(component.element);
    });
  }

  onChangeConditions() {
    const result = Object.entries(this.sortParam)
      .filter(([_k, v]) => v !== undefined && v !== '')
      .reduce((accum, [k, v]) => {
        accum[k] = v;
        return accum;
      }, {});
    const customEvent = new CustomEvent(
      'sort-filter-update',
      {
        detail: result,
        bubbles: true
      }
    );
    this.element.dispatchEvent(customEvent)
  }

  addEventListeners() {
    const {filterName, sliderContainer, filterStatus} = this.subElements;
    filterName.addEventListener(
      'input',
      this.onFilterNameChanged,
      this.abortController.signal
    );
    sliderContainer.addEventListener(
      'range-select',
      this.onPriceRangeChanged,
      this.abortController.signal
    )
    filterStatus.addEventListener(
      'change',
      this.onStatusChanged,
      this.abortController.signal
    )

  }

  onFilterNameChanged = (event) => {
    event.preventDefault();
    const {filterName} = this.subElements;
    this.sortParam['filterNameValue'] = filterName.value;
    this.onChangeConditions();
  }

  onPriceRangeChanged = (event) => {
    this.sortParam['priceFilter'] = event.detail;
    this.onChangeConditions();
  }

  onStatusChanged = (event) => {
    event.preventDefault();
    const {filterStatus} = this.subElements;
    this.sortParam['filterStatus'] = filterStatus.value;
    this.onChangeConditions();
  }
}
