import SortableTable from '../../../components/sortable-table';
import DoubleSlider from '../../../components/double-slider';
import columns from './columns';


export default class ProductsPage {
  element = null;
  components = {};
  subElements = {};

  searchTimeout = null;
  filters = {};

  createComponents() {
    // this.components.nameFilter = new RangePicker(initialDates);

    this.components.priceSlider = new DoubleSlider({
      min: 0,
      max: 5000,
      formatValue: (value) => `${ value } $`
    });

    this.components.productsTable = new SortableTable(columns, {
      isSortLocally: true,
      url: 'api/rest/products'
    });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  onFiltersChange(filterName, filterValue) {
    this.filters[filterName] = filterValue;
    // дебаунс на коленке для фильтрации данных
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadData();
    }, 500);
  }

  loadData() {
    const { price, name, status } = this.filters;

    const requestParams = {};
    const { from: priceFrom, to: priceTo } = price || {};
    if (priceFrom) {
      requestParams.price_gte = priceFrom;
    }

    if (priceTo) {
      requestParams.price_lte = priceTo;
    }

    if (name) {
      requestParams.title_like = name;
    }

    if (status && status !== 'none') {
      requestParams.status = status;
    }

    this.components.productsTable.loadTableData({
      ...requestParams,
      reset: true
    });
  }

  get template() {
    return `<div class='products-list'>
      <div class='content__top-panel'>
         <h2 class='page-title'>Товары</h2>
         </div>
         <div class='filter-form content-box content-box_small'>
            <form class='form form-inline'>
              <div class='form-group '>
                    <label class='form-label'>Название товара:</label>
                    <input required='' type='text' data-element='nameFilter' class='form-control' placeholder='Поиск...'>
              </div>
              <div class='form-group' data-element='sliderContainer'>
                 <label class='form-label'>Цена:</label>
              </div>
              <div class='form-group '>
                    <label class='form-label'>Статус:</label>
                    <select class='form-control'  data-element='stateSelect'>
                       <option value='none'>Любой</option>
                       <option value='1'>Активный</option>
                       <option value='0'>Неактивный</option>
                    </select>
              </div>
            </form>
         </div>
         <div data-element='productsContainer'>
         </div>
      </div>`;
  }

  addEventListeners() {
    this.subElements.nameFilter.addEventListener('change', ({ target: { value } }) => {
      this.onFiltersChange('name', value);
    });

    this.subElements.stateSelect.addEventListener('change', ({ target: { value } }) => {
      this.onFiltersChange('status', value);
    });


    this.element.addEventListener('range-select', ({ detail }) => {
      this.onFiltersChange('price', detail);
    });
  }

  async render() {
    const container = document.createElement('div');
    container.innerHTML = this.template;


    this.element = container.firstElementChild;

    this.createComponents();
    this.subElements = this.getSubElements();

    this.subElements.productsContainer.append(this.components.productsTable.element);
    this.subElements.sliderContainer.append(this.components.priceSlider.element);

    this.addEventListeners();
    return this.element;
  }
}
