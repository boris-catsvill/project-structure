import { productHeader } from "../../../components/sortable-table/configs/productHeader";
import { productsTableState } from "../../../state/TableEventState";
import { productFormFilterState } from "../../../state/FormEventState";

import BaseComponent from "../../../components/BaseComponent";
import ProductFilterForm from "../../../components/product-form/ProductFilterForm";
import SortableTable from "../../../components/sortable-table";

const productFormFilter = new ProductFilterForm(productFormFilterState)

const sortableTable = new SortableTable({
  headerConfig: productHeader,
  sorted: {
    fieldValue: productHeader.find(item => item.sortable).id,
    orderValue: 'asc'
  }
}, productsTableState)

export default class extends BaseComponent {
  #elementDOM = null

  timerUpdate = null

  delayUpdateTable = () => {
    if (this.timerUpdate) {
      clearInterval(this.timerUpdate)
    }
    this.timerUpdate = setTimeout(async () => {
      await this.updateTable()
      this.timerUpdate = null
    }, 500)
  }

  updateTable = async () => {
    const { title, priceFrom, status, priceTo } = productFormFilterState.formState
    const { orderValue: _order, fieldValue: _sort } = sortableTable.sorted
    productsTableState.additionalFilters = {
      price_gte: priceFrom,
      price_lte: priceTo,
      title_like: title,
      status
    }
    const request = {
      _start: 0,
      _end: sortableTable.lazyLoadItems,
      _order,
      _sort,
    }

    await productsTableState.updateData(request, true)
  }

  constructor() {
    super()

    this.addChildrenComponent('productFormFilter', productFormFilter)
    this.addChildrenComponent('sortableTable', sortableTable)
  }

  get element() {
    return this.#elementDOM
  }

  async render() {
    this.#elementDOM = this.createDOMElement(this.template())

    this.renderDOMChildren(this.#elementDOM)

    await this.updateTable()

    this.initEvents()
  }

  initEvents() {
    productFormFilterState.on('changeField', this.delayUpdateTable)
  }

  template() {
    return /*html*/`
      <div>
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">
            Добавить товар
          </a>
        </div>
        
        <div class="content-box content-box_small">
          <span data-mount="productFormFilter"></span>
        </div>
        <span data-mount="sortableTable"></span>
      </div>
    `
  }
}