import DoubleSlider from "../../../components/double-slider"
import SortableTable from "../../../components/sortable-table"
import header from "../../dashboard/bestsellers-header"

export default class ProductsPage {
  doubleSlider = new DoubleSlider()

  render() {
    this.element = this.getTemplate()
    this.subElements = this.getSubElements(this.element)
    this.initialize()
    this.initEventListeners()
    return this.element
  }

  initialize() {
    this.addDoubleSlider()

    this.sortableTable = this.getSortableTable()
    this.subElements.sortableTable.append(this.sortableTable.element)

  }

  addDoubleSlider() {
    this.subElements.sliderContainer.append(this.doubleSlider.element)
    this.doubleSlider.element.addEventListener('range-select', event => {
      this.valuesOfSearch = event.detail
      this.update(this.valuesOfSearch.from, this.valuesOfSearch.to)
    });

  }

  update = (...arr) => {
    this.sortableTable.addParam(...arr)
    this.sortableTable.update()
  }

  initEventListeners() {
    const input = this.subElements.filterName
    const select = this.subElements.filterStatus

    select.addEventListener('change', this.getValuesFromSelect)
    input.addEventListener('input', () => this.update('', '', input.value))

  }
  getValuesFromSelect = event => {
    const select = event.target
    const selectedOption = select.options[select.selectedIndex].value // находим option, выбранный пользователем
    this.update('', '', '', selectedOption ? selectedOption : null ) // TODO
  }



  getSortableTable() {
    const sortableTable = new SortableTable(header,
      {
        url: 'api/rest/products',
      });
    return sortableTable
  }

  getTemplate() {
    return this.createElement(`
      <div class="products-list">
  <div class="content__top-panel">
      <h1 class="page-title">Товары</h1>
      <a href="/products/add" class="button-primary">Добавить товар</a>
  </div>
  <div class="content-box content-box_small">
      <form class="form-inline">
          <div class="form-group">
              <label class="form-label">Сортировать по:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="sliderContainer">
              <label class="form-label">Цена:</label>
          
                  <!-- range slider -->
              
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
  <div class="sortable-tablel"  data-element="sortableTable">
  <!-- sortable table-->
  </div>
</div>
</div> `)
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  createElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  

}