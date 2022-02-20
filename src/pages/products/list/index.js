import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js'
import header from './header.js';

export default class Page {

  element;
  subElements = {};
  components = {};

  filterParams = {
    priceRange: {
      min: 0,
      max: 4000,
    },
    titleLike: '',
    filterStatus: ''
  }

  onInput = (event) => {

    const value = event.target.value.trim();

    this.inputHandler(value)

  }

  async initComponents() {

    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,

    });

    const doubleSlider = new DoubleSlider(this.filterParams.priceRange);
    sortableTable.render()

    this.components = {
      sortableTable,
      doubleSlider
    }

    await this.renderComponents()
    this.initEventListeners()
  }

  render() {

    const element = document.createElement('div');

    element.innerHTML = this.template();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(element);

    this.initComponents()

    return this.element
  }

  renderComponents() {

    for (const [component, { element }] of Object.entries(this.components)) {

      this.subElements[component].append(element)
    }
  }

  template() {
    return `
   <div class="products-list">
		<div class="content__top-panel">
			<h1 class="page-title">Товары</h1>
			<a href="/products/add" class="button-primary" data-element="buttonPrimary">Добавить товар</a>
		</div>
		<div class="content-box content-box_small">
			<form class="form-inline">
				<div class="form-group">
					<label class="form-label">Сортировать по:</label>
					<input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
				</div>
				<div class="form-group" data-element="doubleSlider">
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
		<div data-elem="productsContainer" class="products-list__container">
       <div data-element="sortableTable">
      </div>
		</div>
	</div>
      `
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {

      result[item.dataset.element] = item;
      return result;

    }, {})
  }

  updateComponents() {

    this.components.sortableTable.updata();
  }

  initEventListeners() {

    this.components.doubleSlider.element.addEventListener('range-select', event => {

      const { from, to } = event.detail;

      this.components.sortableTable.setPriceRange({
        min: from,
        max: to
      })

      this.updateComponents()
    });

    this.components.sortableTable.element.addEventListener('params-reset', () => {

      this.subElements.filterName.value = ''
      this.subElements.filterStatus.value = ''
      this.components.doubleSlider.update();

      this.components.sortableTable.setPriceRange(this.filterParams.priceRange);
      this.components.sortableTable.setTitleLike(this.filterParams.titleLike);
      this.components.sortableTable.setFilterStatus(this.filterParams.filterStatus);
      this.updateComponents()

    })

    this.subElements.filterName.addEventListener('input', this.onInput)

    this.subElements.filterStatus.addEventListener('change', (event) => {

      const value = event.target.value;

      this.components.sortableTable.setFilterStatus(value)
      this.updateComponents()

    })
  }

  async inputHandler(value) {

    this.components.sortableTable.setTitleLike(value);
    this.subElements.filterName.removeEventListener('input', this.onInput)

    await this.components.sortableTable.updata()

    this.subElements.filterName.addEventListener('input', this.onInput)

    const currentValue = this.subElements.filterName.value.trim();

    if (currentValue !== value) {
      this.inputHandler(currentValue)

    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
