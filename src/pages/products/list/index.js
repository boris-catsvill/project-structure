import DoubleSlider from "../../../components/double-slider"
import SortableTable from "../../../components/sortable-table"
import header from "../../dashboard/bestsellers-header"
import fetchJson from "../../../utils/fetch-json";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="product-list">
        <div class="content__top-panel">
            <h1 class="page-title">Товары</h1>
            <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box_small">
            <form class="form-inline">
                <div class="form-group">
                    <label class="form-label">Сортировать по:</label>
                    <input type="text" class="form-control" placeholder="Название товара">
                </div>

                <div class="form-group" data-element="doubleSlider">
                  <label class="form-label" style="display: inline;">Цена:</label>
                  <div></div>
                </div>

                <div class="form-group">
                  <label class="form-label">Статус:</label>
                  <select class="form-control">
                    <option value="" selected="">Любой</option>
                    <option value="1">Активный</option>
                    <option value="0">Неактивный</option>
                  </select>
                </div>
            </form>
        </div>

        <div data-element="productsTable" class="products-list__container"></div>

        <!-- <div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder"><div>
        <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
        <button type="button" class="button-primary-outline">Очистить фильтры</button>
        </div></div>
        </div></div> -->

      </div>`

    this.element = element.firstElementChild;
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
      min: 0,
      max: 4000,
      selected: {from: 0, to: 4000}
    })

    this.components.productsTable = new SortableTable(header, {
      url: `/api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30`,
      sortByDefault: header[1].id
    })
  }

  async renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component]
      const { element } = this.components[component]
      root.append(element)
    })

  }
   initEventListeners() {
    this.subElements.doubleSlider.addEventListener('range-select', async (e)=> {
      console.log(e.detail)
      const newProductsData = await fetchJson(
        `https://course-js.javascript.ru/api/rest/products?_embed=subcategory.category&price_gte=${e.detail.from}&price_lte=${e.detail.to}&_sort=quantity&_order=asc&_start=0&_end=30`
      )
      this.components.productsTable.updateBody(newProductsData)
    })
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
