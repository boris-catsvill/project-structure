import { salesHeader } from "../../components/sortable-table/configs/salesHeader";
import { salesTableState } from "../../state/TableEventState";
import RangePicker from "../../components/range-picker";
import BaseComponent from "../../components/BaseComponent";
import SortableTable from "../../components/sortable-table";

const getChildren = () => {
  const sortableTable = new SortableTable({
    headerConfig: salesHeader,
    sorted: {
      fieldValue: salesHeader.find(item => item.sortable).id,
      orderValue: 'asc'
    }
  }, salesTableState)

  const rangePicker = new RangePicker({
    from: new Date('08.01.2022'),
    to: new Date()
  })

  return {
    sortableTable,
    rangePicker
  }
}

export default class extends BaseComponent {
  #elementDOM = null

  updateRangeTable = async () => {
    const { sortableTable, rangePicker } = this.DOMChildren
    const { from, to } = rangePicker.selected

    sortableTable.stateManager.additionalFilters = {
      createdAt_gte: from,
      createdAt_lte: to
    }

    const { sorted, lazyLoadItems } = sortableTable
    const { fieldValue: _sort, orderValue: _order } = sorted

    sortableTable.stateManager.updateData({
      _sort,
      _order,
      _end: lazyLoadItems,
      _start: 0
    }, true)
  }

  constructor() {
    super()

    Object.entries(getChildren()).forEach(([key, component]) => {
      this.addChildrenComponent(key, component)
    })
  }

  get element() {
    return this.#elementDOM
  }

  async render() {
    this.#elementDOM = this.createDOMElement(this.template())

    await this.updateRangeTable()

    this.renderDOMChildren(this.#elementDOM)

    this.initEvents()
  }

  remove() {
    this.#elementDOM.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.memoDOM.clear()
    this.removeEvents()
    this.clearChildrenComponents()
  }

  initEvents() {
    const { rangePicker } = this.DOMChildren  
    rangePicker.element.addEventListener('date-select', this.updateRangeTable)
  }

  removeEvents() {
    const { rangePicker } = this.DOMChildren  
    rangePicker.element.removeEventListener('date-select', this.updateRangeTable)
  }

  template() {
    return /*html*/`
      <div>
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <span data-mount="rangePicker"></span>
        </div>
        
        <span data-mount="sortableTable"></span>
      </div>
    `
  }
}