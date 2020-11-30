import SortableTable from '../../components/sortable-table/index.js'
import RangePicker from "../../components/range-picker"

const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Клиент',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Дата',
    sortable: true,
    sortType: 'date',
    template: data => `${new Date(data).toLocaleDateString('ru', {month: 'short', day: '2-digit', year: 'numeric'})}`
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'formattedNumber',
    template: data => '$' + data
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'delivery',
  }
]

export default class Page {
  element = null
  subElements = {}
  components = {}

  constructor() {
    this.to = new Date()
    this.from = new Date(this.to.getTime() - (50 * 24 * 60 * 60 * 1000))
  }

  async render() {
    this.element = document.createElement('div')
    this.element.innerHTML = this.template
    this.subElements = this.getSubElements(this.element)
    await this.initComponents()
    this.initEventListeners()
    this.renderComponents()
    return this.element
  }

  get template() {
    return `
    <div class="content__top-panel">
        <h1 class="page-title">Продажи</h1>
        <div data-element="rangePicker"></div>
    </div>
    <div data-element="salesList"></div>`
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')
    return [...elements].reduce((accum, item) => {
      accum[item.dataset.element] = item
      return accum
    }, {})
  }

  async initComponents() {
    this.components.rangePicker = new RangePicker({from: this.from, to: this.to})
    this.components.salesList = new SortableTable({
      header,
      url: `api/rest/orders?createdAt_gte=${this.from.toISOString()}&createdAt_lte=${this.to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`,
      sortByDefault: header[2].id
    })
  }

  initEventListeners() {
    this.subElements.rangePicker.addEventListener('date-select', async (e) => {
      const {from, to} = e.detail
      const salesData = await this.components.salesList.fetchData({
        dateFrom: from.toISOString(),
        dateTo: to.toISOString()
      })
      this.components.salesList.updateBody(salesData)
    })
  }

  renderComponents() {
    Object.keys(this.subElements).forEach(element => {
      const root = this.subElements[element]
      root.append(this.components[element].element)
    })
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy()
    }
  }
}

