import SortableTable from '../../../components/sortable-table';
import header from './list-header';
import PageComponent from '../../page';
import DoubleSlider from '../../../components/double-slider';
import NotificationMessage from '../../../components/notification';

export default class Page extends PageComponent {
  minPrice = 0;
  maxPrice = 4000;
  defaultSorted = {
    _embed: 'subcategory.category',
    id: 'title',
    order: 'asc',
    price_gte: this.minPrice,
    price_lte: this.maxPrice,
  };

  sorted = { ...this.defaultSorted };

  debounce;

  handleChangePrice = event => {
    this.changePrice(event);
  }

  handleChangeStatus = event => {
    this.changeStatus(event);
  }

  handleInputFilterName = event => {
    this.inputFilterName(event)
  }

  handleResetFilters = event => {
    this.resetFilters(event);
  }

  get template() {
    return `
      <div class='products-list'>
        <div class='content__top-panel'>
          <h1 class='page-title'>Товары</h1>
          <a href='/products/add' class='button-primary'>Добавить товар</a>
        </div>
        
        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Сортировать по:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
            </div>
            <div class="form-group" data-element="sliderContainer">
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
        </div>
        
        <div data-element='productsContainer' class='products-list__container'></div>
      </div>
    `;
  }

  initComponents() {
    const productsContainer = new SortableTable(header, {
      url: `${this.backendUrl}/api/rest/products`,
      sorted: this.sorted
    });

    const sliderContainer = new DoubleSlider({
      min: this.minPrice,
      max: this.maxPrice,
      formatValue: value => `$${value}`
    });

    this.components.productsContainer = productsContainer;
    this.components.sliderContainer = sliderContainer;
  }

  initEventListeners() {
    this.components.sliderContainer.element.addEventListener('range-select', this.handleChangePrice);
    this.subElements.filterStatus.addEventListener('change', this.handleChangeStatus)
    this.subElements.filterName.addEventListener('input', this.handleInputFilterName)
    this.components.productsContainer.subElements.resetButton.addEventListener('click', this.handleResetFilters);
  }

  changePrice(event) {
    const { from, to } = event.detail;

    this.sorted = {
      ...this.sorted,
      price_gte: from,
      price_lte: to
    }

    this.update();
  }

  changeStatus(event) {
    const status = this.subElements.filterStatus.value;

    if (status !== '') {
      this.sorted.status = status;
    } else {
      delete this.sorted.status;
    }

    this.update();
  }

  inputFilterName(event) {
    const value = this.subElements.filterName.value;

    clearTimeout(this.debounce);

    this.debounce = setTimeout(() => {
      if (value !== '') {
        this.sorted.title_like = value;
      } else {
        delete this.sorted.title_like;
      }

      this.update();
    }, 250);
  }

  resetFilters(event) {
    this.sorted = { ...this.defaultSorted };
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.components.sliderContainer.reset();

    this.update();
  }

  async update() {
    try {
      await this.components.productsContainer.update(this.sorted);

      this.components.productsContainer.element.classList.toggle(
        'sortable-table_empty',
        this.components.productsContainer.data.length === 0
      );
    } catch (error) {
      console.error(error);

      const notification = new NotificationMessage(error.message, {
        duration: 2000,
        type: 'error'
      });

      notification.show();
    }
  }
}
