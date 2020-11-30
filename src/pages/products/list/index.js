import DoubleSlider from "../../../components/double-slider"
import SortableTable from "../../../components/sortable-table"
import fetchJson from "../../../utils/fetch-json"
import header from "../../dashboard/bestsellers-header"

export default class Page {
  element
  subElements = {}
  components = {}
  priceFrom = 0
  priceTo = 4000

  async render() {
    const element = document.createElement('div')

    element.innerHTML = `
      <div class="product-list">
        <div class="content__top-panel">
            <h1 class="page-title" title="Pizda">Товары</h1>
            <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box content-box_small">
            <form class="form-inline">
                <div class="form-group">
                    <label class="form-label">Сортировать по:</label>
                    <input type="text" class="form-control" id="text-filter" placeholder="Название товара">
                </div>

                <div class="form-group" data-element="doubleSlider">
                  <label class="form-label">Цена:</label>
                </div>

                <div class="form-group">
                  <label class="form-label">Статус:</label>
                  <select id="status-filter" class="form-control">
                    <option value="" selected="">Любой</option>
                    <option value="1">Активный</option>
                    <option value="0">Неактивный</option>
                  </select>
                </div>
            </form>
        </div>

        <div data-element="productsTable" class="products-list__container"></div>
      </div>`

    this.element = element.firstElementChild
    this.subElements = this.getSubElements(this.element)
    this.initComponents()
    await this.renderComponents();
    this.initEventListeners()
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')
    return [...elements].reduce((accum, item) => {
      accum[item.dataset.element] = item
      return accum
    }, {})
  }

  initComponents() {
    this.components.doubleSlider = new DoubleSlider({
      min: this.priceFrom,
      max: this.priceTo,
      selected: {from: this.priceFrom, to: this.priceTo}
    })

    this.components.productsTable = new SortableTable({
      header,
      url: `api/rest/products?_embed=subcategory.category&price_gte=${this.priceFrom}&price_lte=${this.priceTo}&_sort=quantity&_order=asc&_start=0&_end=30\``,
      sortByDefault: header[1].id
    })
  }

  async renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component]
      const {element} = this.components[component]
      root.append(element)
    })
  }

  initEventListeners() {
    this.subElements.doubleSlider.addEventListener('range-select', async (e) => {
      const newProductsData = await fetchJson(
        `https://course-js.javascript.ru/api/rest/products?_embed=subcategory.category&price_gte=${e.detail.from}&price_lte=${e.detail.to}&_sort=quantity&_order=asc&_start=0&_end=30`
      )
      this.components.productsTable.updateBody(newProductsData)
    })

    const textFilter = this.element.querySelector('#text-filter')
    textFilter.addEventListener('input', async () => {
      const newProductsData = await this.components.productsTable.fetchData({
        title_like: textFilter.value
      })
      this.components.productsTable.updateBody(newProductsData)
    })

    const statusFilter = this.element.querySelector('#status-filter')
    statusFilter.addEventListener('input', async () => {
      const newProductsData = await this.components.productsTable.fetchData({
        status: statusFilter.value
      })
      this.components.productsTable.updateBody(newProductsData)
    })
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy()
    }
  }
}
