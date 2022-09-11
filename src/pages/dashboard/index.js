import { 
  salesChartState, 
  ordersChartState,
  customersChartState 
} from '../../state/ChartEventState.js'
import { bestsellersTableState } from '../../state/TableEventState.js'
import { productHeader } from '../../components/sortable-table/configs/productHeader'
import BaseComponent from '../../components/BaseComponent.js'
import RangePicker from '../../components/range-picker'
import ColumnChart from '../../components/column-chart'
import SortableTable from '../../components/sortable-table'

const rangePicker = new RangePicker({
  from: new Date('08.01.2022'),
  to: new Date()
})

const ordersChart = new ColumnChart({
  label: 'Заказы',
  link: 'orders',
}, ordersChartState)

const salesChart = new ColumnChart({
  label: 'Продажи',
  link: 'sales',
}, salesChartState)

const customersChart = new ColumnChart({
  label: 'Клиенты',
  link: 'customers',
}, customersChartState)

const sortableTable = new SortableTable({
    headerConfig: productHeader,
    sorted: {
      fieldValue: productHeader.find(item => item.sortable).id,
      orderValue: 'asc'
    },
    isSortLocally: true,
    isLazyLoad: false
}, bestsellersTableState)

export default class extends BaseComponent {
  #elementDOM = null

  updateCharts = async () => {
    const { from, to } = rangePicker.selected
    await Promise.all([
      ordersChartState.updateChartRange(from, to), 
      salesChartState.updateChartRange(from, to),
      customersChartState.updateChartRange(from, to),

      sortableTable.updateTableRange(from, to)
    ])
  }

  constructor() {
    super()

    this.addChildrenComponent('rangePicker', rangePicker)
    this.addChildrenComponent('ordersChart', ordersChart)
    this.addChildrenComponent('salesChart', salesChart)
    this.addChildrenComponent('customersChart', customersChart)
    this.addChildrenComponent('sortableTable', sortableTable)
  }

  get element() {
    return this.#elementDOM
  }

  async render() {
    this.#elementDOM = this.createDOMElement(this.template())

    await this.updateCharts()

    this.renderDOMChildren(this.#elementDOM)

    this.initEvents()
  }

  initEvents() {
    rangePicker.element.addEventListener('date-select', () => {
      this.updateCharts()
    })
  }

  template() {
    return /*html*/`
      <div>
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <span data-mount="rangePicker"></span>
        </div>
        <div class="dashboard__charts">
          <span data-mount="ordersChart"></span>
          <span data-mount="salesChart"></span>
          <span data-mount="customersChart"></span>
        </div>

        <h3 class="block-title">Лидеры продаж</h3>
        <span data-mount="sortableTable"></span>
      </div>
    `
  }
}