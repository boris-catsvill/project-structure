import { productHeader } from "../../../components/sortable-table/configs/productHeader";
import { productsTableState } from "../../../state/TableEventState";
import { productFormFilterState } from "../../../state/FormEventState";

import BaseComponent from "../../../components/BaseComponent";
import ProductFormFilter from "../../../components/product-form/ProductFormFilter";
import SortableTable from "../../../components/sortable-table";

const productFormFilter = new ProductFormFilter(productFormFilterState)

const sortableTable = new SortableTable({
  headerConfig: productHeader,
  sorted: {
    fieldValue: productHeader.find(item => item.sortable).id,
    orderValue: 'asc'
  }
}, productsTableState)

export default class extends BaseComponent {
  #elementDOM = null

  delayUpdateTable = () => {}

  updateTable = async () => {
    const { title, priceFrom, status, priceTo } = productFormFilterState.formState
    const { orderValue: _order, fieldValue: _sort } = sortableTable.sorted
    const request = {
      price_gte: priceFrom,
      price_lte: priceTo,
      title_like: title,
      _start: 0,
      _end: sortableTable.lazyLoadItems,
      _order,
      _sort,
      status
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
    productFormFilterState.on('changeField', this.updateTable)
  }

  template() {
    return /*html*/`
      <div>
        <h1>Товары</h1>
        <div class="content-box content-box_small">
          <span data-mount="productFormFilter"></span>
        </div>
        <span data-mount="sortableTable"></span>
      </div>
    `
  }
}